import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { Mandate, MandateRadarStats } from '../../types/mandate';
import { auditCombinedMandates, auditSyntheticStatement } from '../../services/mandateGraphEngine';
import { AuraSyncResult } from '../../services/neo4jSync';
import { buildMandateAuditPrompt } from '../../services/chatbotService';
import { SMSMessage } from '../../types/sms';
import { AnnualBleedCard } from './AnnualBleedCard';
import { MandateCard } from './MandateCard';
import { CancellationModal } from './CancellationModal';
import { CypherModal } from './CypherModal';
import { Neo4jAuraSyncModal } from './Neo4jAuraSyncModal';
import { SyntheticDataToolbar } from './SyntheticDataToolbar';
import { GraphVisualizerCard } from './GraphVisualizerCard';

type FilterType = 'ALL' | 'THREATS' | 'PRICE_CREEP' | 'TRIAL_TRAP' | 'DOUBLE_SUBSCRIPTION' | 'ZOMBIE_CHARGE';

interface MandateRadarViewProps {
  realMessages?: SMSMessage[];
  onAskAI?: (prompt: string) => void;
}

export const MandateRadarView: React.FC<MandateRadarViewProps> = ({ realMessages, onAskAI }) => {
  const initialAudit = useMemo(() => auditCombinedMandates(realMessages), [realMessages]);
  const [mandates, setMandates] = useState<Mandate[]>(() => initialAudit.mandates);
  const [stats, setStats] = useState<MandateRadarStats | null>(() => initialAudit.stats);
  const [prevMessages, setPrevMessages] = useState<SMSMessage[] | undefined>(realMessages);

  // Sync state during render when real messages stream updates (React 19 pattern)
  if (realMessages !== prevMessages) {
    setPrevMessages(realMessages);
    const updated = auditCombinedMandates(realMessages);
    setMandates(updated.mandates);
    setStats(updated.stats);
  }

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [activeMandateForCancel, setActiveMandateForCancel] = useState<Mandate | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [isCypherModalOpen, setIsCypherModalOpen] = useState<boolean>(false);
  const [isAuraModalOpen, setIsAuraModalOpen] = useState<boolean>(false);
  const [auraSyncResult, setAuraSyncResult] = useState<AuraSyncResult | null>(null);

  // Open the Live Neo4j Aura Synchronizer
  const handleOpenAuraAudit = useCallback(() => {
    setIsAuraModalOpen(true);
  }, []);

  // Filtered mandates
  const filteredMandates = useMemo(() => {
    return mandates.filter(m => {
      // 1. Threat Type filter
      if (selectedFilter === 'THREATS' && m.threatType === 'NONE') return false;
      if (selectedFilter === 'PRICE_CREEP' && m.threatType !== 'PRICE_CREEP') return false;
      if (selectedFilter === 'TRIAL_TRAP' && m.threatType !== 'TRIAL_TRAP') return false;
      if (selectedFilter === 'DOUBLE_SUBSCRIPTION' && m.threatType !== 'DOUBLE_SUBSCRIPTION') return false;
      if (selectedFilter === 'ZOMBIE_CHARGE' && m.threatType !== 'ZOMBIE_CHARGE') return false;

      // 2. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.merchantName.toLowerCase().includes(q);
        const matchDesc = m.rawDescriptor.toLowerCase().includes(q);
        const matchCat = m.category.toLowerCase().includes(q);
        const matchAcc = m.account.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat && !matchAcc) return false;
      }

      return true;
    });
  }, [mandates, selectedFilter, searchQuery]);

  const handleCancelPress = (mandate: Mandate) => {
    setActiveMandateForCancel(mandate);
    setIsCancelModalOpen(true);
  };

  const handleGenerateSyntheticData = useCallback(() => {
    setIsAuditing(true);
    setTimeout(() => {
      const { mandates: synthMandates, stats: synthStats } = auditSyntheticStatement();
      setMandates(synthMandates);
      setStats(synthStats);
      setIsAuditing(false);
    }, 200);
  }, []);

  const handleResetSyntheticData = useCallback(() => {
    const { mandates: freshMandates, stats: freshStats } = auditCombinedMandates(realMessages);
    setMandates(freshMandates);
    setStats(freshStats);
  }, [realMessages]);

  return (
    <View style={styles.container}>
      {/* Hero Annual Bleed Card */}
      {stats && (
        <AnnualBleedCard
          stats={stats}
          onAuditPress={handleOpenAuraAudit}
          isAuditing={isAuditing}
          isAuraSynced={!!auraSyncResult?.threats}
          auraLatency={auraSyncResult?.latencyMs}
        />
      )}

      {/* 1-Tap Synthetic Data Generator for Testing & Demo */}
      <SyntheticDataToolbar
        onGenerate={handleGenerateSyntheticData}
        onReset={handleResetSyntheticData}
        isGenerating={isAuditing}
      />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchPrefix}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search merchant, descriptor, or account..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Threat Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterPill, selectedFilter === 'ALL' && styles.filterPillActive]}
          onPress={() => setSelectedFilter('ALL')}
        >
          <Text style={[styles.filterPillText, selectedFilter === 'ALL' && styles.filterPillTextActive]}>
            ALL ({mandates.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, selectedFilter === 'THREATS' && styles.filterPillActiveDanger]}
          onPress={() => setSelectedFilter('THREATS')}
        >
          <Text style={[styles.filterPillText, selectedFilter === 'THREATS' && styles.filterPillTextActive]}>
            🚨 THREATS ({stats?.threatsCount || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, selectedFilter === 'PRICE_CREEP' && styles.filterPillActive]}
          onPress={() => setSelectedFilter('PRICE_CREEP')}
        >
          <Text style={[styles.filterPillText, selectedFilter === 'PRICE_CREEP' && styles.filterPillTextActive]}>
            📈 PRICE HIKES ({stats?.priceCreepsCount || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, selectedFilter === 'TRIAL_TRAP' && styles.filterPillActive]}
          onPress={() => setSelectedFilter('TRIAL_TRAP')}
        >
          <Text style={[styles.filterPillText, selectedFilter === 'TRIAL_TRAP' && styles.filterPillTextActive]}>
            ⚠️ TRIAL TRAPS ({stats?.trialTrapsCount || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, selectedFilter === 'DOUBLE_SUBSCRIPTION' && styles.filterPillActive]}
          onPress={() => setSelectedFilter('DOUBLE_SUBSCRIPTION')}
        >
          <Text style={[styles.filterPillText, selectedFilter === 'DOUBLE_SUBSCRIPTION' && styles.filterPillTextActive]}>
            🔄 DUPLICATES ({stats?.doubleSubscriptionsCount || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, selectedFilter === 'ZOMBIE_CHARGE' && styles.filterPillActive]}
          onPress={() => setSelectedFilter('ZOMBIE_CHARGE')}
        >
          <Text style={[styles.filterPillText, selectedFilter === 'ZOMBIE_CHARGE' && styles.filterPillTextActive]}>
            🧟 ZOMBIES ({stats?.zombieChargesCount || 0})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Mandate Cards List */}
      <View style={styles.listContainer}>
        {filteredMandates.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>NO COMMITMENTS FOUND</Text>
            <Text style={styles.emptySubtitle}>Try changing your filter or search query</Text>
          </View>
        ) : (
          filteredMandates.map((m) => (
            <MandateCard
              key={m.id}
              mandate={m}
              onCancelPress={handleCancelPress}
              onAskAIPress={(mandate) => {
                if (onAskAI) {
                  onAskAI(
                    buildMandateAuditPrompt({
                      merchantName: mandate.merchantName,
                      rawDescriptor: mandate.rawDescriptor,
                      monthlyAmount: mandate.monthlyEstimate,
                      paymentRail: mandate.paymentRail,
                      threatType: mandate.threatType,
                      status: mandate.status,
                    })
                  );
                }
              }}
            />
          ))
        )}
      </View>

      {/* AI Copilot Audit Banner */}
      {onAskAI && (
        <View style={styles.aiCopilotCard}>
          <View style={styles.aiCopilotTop}>
            <Text style={styles.aiCopilotBadge}>🤖 SUBCLEAR AI COPILOT</Text>
            <Text style={styles.aiCopilotStatus}>ACTIVE // FASTAPI HOSTED</Text>
          </View>
          <Text style={styles.aiCopilotTitle}>NEED DEEP SUBSCRIPTION INTELLIGENCE?</Text>
          <Text style={styles.aiCopilotDesc}>
            Chat with SubClear AI to decode obscure bank descriptors, generate customized cancellation dispute notices, or audit sneaky renewals.
          </Text>
          <TouchableOpacity
            style={styles.aiCopilotButton}
            onPress={() => onAskAI('Can you perform a full audit of all my active mandates and highlight the highest annualized risks?')}
            activeOpacity={0.8}
          >
            <Text style={styles.aiCopilotButtonText}>💬 LAUNCH SUBCLEAR AI COPILOT</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Neo4j Visual Graph Intelligence Card */}
      <GraphVisualizerCard
        threats={auraSyncResult?.threats}
        onOpenAuraModal={() => setIsAuraModalOpen(true)}
        onOpenCypherModal={() => setIsCypherModalOpen(true)}
      />

      {/* Cancellation Runbook Modal */}
      <CancellationModal
        visible={isCancelModalOpen}
        mandate={activeMandateForCancel}
        onClose={() => setIsCancelModalOpen(false)}
      />

      {/* Neo4j Cypher Inspector Modal */}
      <CypherModal
        visible={isCypherModalOpen}
        onClose={() => setIsCypherModalOpen(false)}
      />

      {/* Neo4j Aura Live Synchronizer Modal */}
      <Neo4jAuraSyncModal
        visible={isAuraModalOpen}
        mandates={mandates}
        onClose={() => setIsAuraModalOpen(false)}
        onSyncComplete={(res) => setAuraSyncResult(res)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    paddingHorizontal: 10,
    marginBottom: 10,
    ...BRUTALIST.shadowSm,
  },
  searchPrefix: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: BRUTALIST.fontSans,
    fontSize: 12,
    color: COLORS.ink,
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    fontSize: 12,
    fontFamily: BRUTALIST.fontSansBold,
    color: '#888',
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: COLORS.ink,
  },
  filterPillActiveDanger: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  filterPillText: {
    fontSize: 10.5,
    fontFamily: BRUTALIST.fontSansBold,
    color: COLORS.ink,
  },
  filterPillTextActive: {
    color: '#FFF',
  },
  listContainer: {
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyTitle: {
    fontSize: 13,
    fontFamily: BRUTALIST.fontSansBold,
    color: '#4B5563',
  },
  emptySubtitle: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontSans,
    color: '#9CA3AF',
    marginTop: 4,
  },
  aiCopilotCard: {
    backgroundColor: '#111827',
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    padding: 14,
    marginBottom: 16,
    ...BRUTALIST.shadowDefault,
  },
  aiCopilotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiCopilotBadge: {
    backgroundColor: '#F3F4F6',
    color: '#111827',
    fontSize: 9,
    fontFamily: BRUTALIST.fontSansBold,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  aiCopilotStatus: {
    color: '#10B981',
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontSansBold,
  },
  aiCopilotTitle: {
    fontSize: 14,
    fontFamily: BRUTALIST.fontSansBold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aiCopilotDesc: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontSans,
    color: '#D1D5DB',
    lineHeight: 15,
    marginBottom: 12,
  },
  aiCopilotButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    ...BRUTALIST.shadowSm,
  },
  aiCopilotButtonText: {
    color: '#111827',
    fontSize: 11,
    fontFamily: BRUTALIST.fontSansBold,
    letterSpacing: 0.3,
  },
});
