import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { BRUTALIST } from '../theme/styles';
import { SMSMessage, ScanStats, FilterCategory, TransactionType } from '../types/sms';
import {
  getStoredSMSMessages,
  getLastScanTimestamp,
  computeScanStats,
  addSMSMessage,
  resetToDefaultMockData,
} from '../services/smsStorage';
import {
  scanSMSInbox,
  requestSMSPermissions,
  checkSMSPermission,
} from '../services/smsReader';
import {
  registerBackgroundScan,
  SCAN_INTERVAL_SECONDS,
} from '../services/scannerService';

// Brutalist Components
import { BrutalistHeader } from '../components/brutalist/BrutalistHeader';
import { BrutalistTicker } from '../components/brutalist/BrutalistTicker';
import { ScanStatusCard } from '../components/dashboard/ScanStatusCard';
import { FinancialSummaryCard } from '../components/dashboard/FinancialSummaryCard';
import { CategoryBreakdownChart } from '../components/dashboard/CategoryBreakdownChart';
import { MessageTypeDistribution } from '../components/dashboard/MessageTypeDistribution';
import { UrgentAlertsCard } from '../components/dashboard/UrgentAlertsCard';
import { SMSFilterBar } from '../components/sms/SMSFilterBar';
import { SMSCard } from '../components/sms/SMSCard';
import { SMSDetailModal } from '../components/sms/SMSDetailModal';
import { TestSMSModal } from '../components/devtools/TestSMSModal';
import { MandateRadarView } from '../components/mandate/MandateRadarView';
import { ChatScreenView } from '../components/chat/ChatScreenView';

export const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MANDATE_RADAR' | 'AI_CHATBOT' | 'SMS_FEED'>('MANDATE_RADAR');
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [stats, setStats] = useState<ScanStats | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(SCAN_INTERVAL_SECONDS);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScanTime, setLastScanTime] = useState<number>(() => Date.now());
  const [isNativeAndroid] = useState<boolean>(Platform.OS === 'android');
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  // Filters & Search
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedMessage, setSelectedMessage] = useState<SMSMessage | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  // Refresh message state and stats
  const refreshState = useCallback((msgs: SMSMessage[], scanTime: number) => {
    setMessages(msgs);
    setLastScanTime(scanTime);
    const computed = computeScanStats(msgs, scanTime);
    setStats(computed);
  }, []);

  // Perform inbox scan
  const executeScan = useCallback(
    async (simulateIncoming: boolean = false) => {
      setIsScanning(true);
      try {
        const result = await scanSMSInbox(simulateIncoming);
        const scanTimestamp = Date.now();
        refreshState(result.allMessages, scanTimestamp);
        setSecondsRemaining(SCAN_INTERVAL_SECONDS);
      } catch (err) {
        console.error('Scan failed:', err);
      } finally {
        setIsScanning(false);
      }
    },
    [refreshState]
  );

  // Initial load
  useEffect(() => {
    let isMounted = true;

    async function init() {
      // Check Android permissions
      if (Platform.OS === 'android') {
        const granted = await checkSMSPermission();
        if (isMounted) setHasPermission(granted);
        await registerBackgroundScan();
      }

      // Load stored messages
      const storedMsgs = await getStoredSMSMessages();
      const lastScan = await getLastScanTimestamp();

      if (isMounted) {
        refreshState(storedMsgs, lastScan);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [refreshState]);

  // Periodic 3-Minute Interval Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Timer finished: trigger periodic 3-min rescan
          executeScan(true);
          return SCAN_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [executeScan]);

  const handleRequestPermission = async () => {
    const granted = await requestSMSPermissions();
    setHasPermission(granted);
    if (granted) {
      executeScan(false);
    } else {
      Alert.alert(
        'Permission Denied',
        'Finatic will operate in simulator/demo mode. You can still paste SMS messages or inject simulated transactions to track finances.'
      );
    }
  };

  const handleOpenDetail = (msg: SMSMessage) => {
    setSelectedMessage(msg);
    setIsDetailModalOpen(true);
  };

  const handleAddCustomMessage = async (newMsg: SMSMessage) => {
    const updated = await addSMSMessage(newMsg);
    refreshState(updated, Date.now());
  };

  const handleResetData = async () => {
    const resetMsgs = await resetToDefaultMockData();
    refreshState(resetMsgs, Date.now());
    setSecondsRemaining(SCAN_INTERVAL_SECONDS);
  };

  // Filter Counts
  const filterCounts = useMemo(() => {
    const counts: Record<FilterCategory, number> = {
      ALL: messages.length,
      DEBIT: 0,
      CREDIT: 0,
      BILL_DUE: 0,
      OTP_AUTH: 0,
      INVESTMENT: 0,
      PROMOTIONAL: 0,
    };

    for (const m of messages) {
      const type = m.parsed.type;
      if (type in counts) {
        counts[type as FilterCategory] = (counts[type as FilterCategory] || 0) + 1;
      }
    }
    return counts;
  }, [messages]);

  // Filtered & Searched Messages
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Category filter
      if (selectedFilter !== 'ALL') {
        if (msg.parsed.type !== selectedFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesBody = msg.body.toLowerCase().includes(query);
        const matchesAddress = msg.address.toLowerCase().includes(query);
        const matchesMerchant = msg.parsed.merchant?.toLowerCase().includes(query) ?? false;
        const matchesBank = msg.parsed.bankOrSender.toLowerCase().includes(query);
        const matchesAmount = msg.parsed.amount?.toString().includes(query) ?? false;
        const matchesAcc = msg.parsed.accountDigits?.toLowerCase().includes(query) ?? false;

        return (
          matchesBody ||
          matchesAddress ||
          matchesMerchant ||
          matchesBank ||
          matchesAmount ||
          matchesAcc
        );
      }

      return true;
    });
  }, [messages, selectedFilter, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Brutalist App Header */}
      <BrutalistHeader
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onResetData={handleResetData}
      />

      {/* Industrial Ticker Tape */}
      <BrutalistTicker
        statusText={
          activeTab === 'MANDATE_RADAR'
            ? 'MANDATE RADAR // AUTODEBIT ASSASSIN // NEO4J KNOWLEDGE GRAPH // SILENT BLEED: ₹62,328/YR // 4 CRITICAL THREATS DETECTED'
            : activeTab === 'AI_CHATBOT'
            ? 'SUBCLEAR AI // FASTAPI RENDER SERVICE // NLP DESCRIPTOR RESOLUTION // MULTI-RAIL RUNBOOKS // 100% SECURE'
            : `FINATIC RADAR // 3-MIN SCAN ACTIVE // ${messages.length} SMS ANALYZED // TOTAL DEBIT: ₹${(stats?.debitTotal || 0).toLocaleString()} // TOTAL CREDIT: ₹${(stats?.creditTotal || 0).toLocaleString()}`
        }
      />

      {/* Primary Tab Navigation Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'MANDATE_RADAR' && styles.tabButtonActive]}
          onPress={() => setActiveTab('MANDATE_RADAR')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeTab === 'MANDATE_RADAR' && styles.tabButtonTextActive]}>
            🎯 AUTO-DEBIT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'AI_CHATBOT' && styles.tabButtonActive]}
          onPress={() => setActiveTab('AI_CHATBOT')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeTab === 'AI_CHATBOT' && styles.tabButtonTextActive]}>
            🤖 SUBCLEAR AI
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'SMS_FEED' && styles.tabButtonActive]}
          onPress={() => setActiveTab('SMS_FEED')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeTab === 'SMS_FEED' && styles.tabButtonTextActive]}>
            ⚡ SMS INBOX
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'AI_CHATBOT' ? (
        <ChatScreenView
          initialPrompt={chatInitialPrompt}
          onClearInitialPrompt={() => setChatInitialPrompt('')}
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'MANDATE_RADAR' ? (
            <MandateRadarView
              onAskAI={(prompt) => {
                setChatInitialPrompt(prompt);
                setActiveTab('AI_CHATBOT');
              }}
            />
          ) : (
          <>
            {/* 1. 3-Minute Scanner Status Card */}
            <ScanStatusCard
              secondsLeft={secondsRemaining}
              totalInterval={SCAN_INTERVAL_SECONDS}
              isScanning={isScanning}
              lastScanTime={lastScanTime}
              totalCount={messages.length}
              onForceScan={() => executeScan(false)}
              isNativeAndroid={isNativeAndroid}
              hasPermission={hasPermission}
              onRequestPermission={handleRequestPermission}
            />

            {/* 2. Urgent Financial Alerts (Upcoming Bills, High Debits) */}
            <UrgentAlertsCard messages={messages} onSelectMessage={handleOpenDetail} />

            {/* 3. Financial Net Flow & Inflow/Outflow Cards */}
            {stats && (
              <FinancialSummaryCard
                totalDebit={stats.debitTotal}
                totalCredit={stats.creditTotal}
                totalBillDue={stats.billDueTotal}
                financialCount={stats.financialCount}
              />
            )}

            {/* 4. Categorized Spending Breakdown Bar Chart */}
            {stats && (
              <CategoryBreakdownChart
                categoryTotals={stats.categoryTotals}
                totalDebit={stats.debitTotal}
              />
            )}

            {/* 5. SMS Type Distribution (Debits vs Credits vs Bills vs OTPs vs Spam) */}
            {stats && (
              <MessageTypeDistribution
                distribution={stats.typeDistribution}
                totalCount={messages.length}
              />
            )}

            {/* 6. Section Divider & Feed Header */}
            <View style={styles.feedHeaderRow}>
              <View style={styles.feedTitleWrap}>
                <Text style={styles.feedTitle}>TRANSACTION & SMS FEED</Text>
                <Text style={styles.feedSubtitle}>
                  SHOWING {filteredMessages.length} OF {messages.length}
                </Text>
              </View>
            </View>

            {/* 7. Search & Filter Bar */}
            <SMSFilterBar
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              counts={filterCounts}
            />

            {/* 8. Messages List */}
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <SMSCard key={msg.id} message={msg} onPress={handleOpenDetail} />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>NO MESSAGES FOUND</Text>
                <Text style={styles.emptyDesc}>
                  No SMS messages match your current filter or search criteria.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      )}

      {/* SMS Entity Detail Modal */}
      <SMSDetailModal
        message={selectedMessage}
        visible={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      {/* Simulator & Custom SMS Modal */}
      <TestSMSModal
        visible={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onAddMessage={handleAddCustomMessage}
        onResetData={handleResetData}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.paper,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.ink,
    paddingVertical: 10,
    alignItems: 'center',
    ...BRUTALIST.shadowSm,
  },
  tabButtonActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.ink,
  },
  tabButtonText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  tabButtonTextActive: {
    color: COLORS.ink,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  feedHeaderRow: {
    marginVertical: 10,
    paddingTop: 10,
    borderTopWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
  },
  feedTitleWrap: {
    marginBottom: 6,
  },
  feedTitle: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  feedSubtitle: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mutedText,
  },
  emptyCard: {
    backgroundColor: COLORS.paperDark,
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyTitle: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.ink,
    marginBottom: 6,
  },
  emptyDesc: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 11,
    color: COLORS.mutedText,
    textAlign: 'center',
  },
});
