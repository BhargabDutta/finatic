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
import { auditSyntheticStatement } from '../../services/mandateGraphEngine';
import { AuraSyncResult } from '../../services/neo4jSync';
import { buildMandateAuditPrompt } from '../../services/chatbotService';
import { AnnualBleedCard } from './AnnualBleedCard';
import { MandateCard } from './MandateCard';
import { CancellationModal } from './CancellationModal';
import { CypherModal } from './CypherModal';
import { Neo4jAuraSyncModal } from './Neo4jAuraSyncModal';

type FilterType = 'ALL' | 'THREATS' | 'PRICE_CREEP' | 'TRIAL_TRAP' | 'DOUBLE_SUBSCRIPTION' | 'ZOMBIE_CHARGE';

interface MandateRadarViewProps {
  onAskAI?: (prompt: string) => void;
}

export const MandateRadarView: React.FC<MandateRadarViewProps> = ({ onAskAI }) => {
  const [initialAudit] = useState(() => auditSyntheticStatement());
  const [mandates, setMandates] = useState<Mandate[]>(initialAudit.mandates);
  const [stats, setStats] = useState<MandateRadarStats | null>(initialAudit.stats);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [activeMandateForCancel, setActiveMandateForCancel] = useState<Mandate | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [isCypherModalOpen, setIsCypherModalOpen] = useState<boolean>(false);
  const [isAuraModalOpen, setIsAuraModalOpen] = useState<boolean>(false);
  const [auraSyncResult, setAuraSyncResult] = useState<AuraSyncResult | null>(null);

  // Re-run synthetic statement audit
  const runAudit = useCallback(() => {
    setIsAuditing(true);
    setTimeout(() => {
      const { mandates: auditedMandates, stats: auditedStats } = auditSyntheticStatement();
      setMandates(auditedMandates);
      setStats(auditedStats);
      setIsAuditing(false);
    }, 400);
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

  return (
    <View style={styles.container}>
      {/* Hero Annual Bleed Card */}
      {stats && (
        <AnnualBleedCard
          stats={stats}
          onAuditPress={runAudit}
          isAuditing={isAuditing}
        />
      )}

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchPrefix}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="SEARCH MERCHANT, DESCRIPTOR OR ACCOUNT..."
          placeholderTextColor="#888"
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

      {/* Neo4j Graph Showcase Card */}
      <View style={styles.neo4jCard}>
        <View style={styles.neo4jTop}>
          <Text style={[styles.neo4jBadge, auraSyncResult?.threats && styles.neo4jBadgeLive]}>
            {auraSyncResult?.threats ? '🟢 AURA LIVE SYNCED' : 'NEO4J AURA GATEWAY'}
          </Text>
          <Text style={styles.neo4jStatus}>
            {auraSyncResult?.threats
              ? `⚡ ${auraSyncResult.latencyMs}ms // ${auraSyncResult.threats.nodeCount} NODES`
              : 'STANDBY // TRANSACTIONAL HTTP'}
          </Text>
        </View>
        <Text style={styles.neo4jTitle}>FINANCIAL KNOWLEDGE GRAPH</Text>
        <Text style={styles.neo4jDesc}>
          {auraSyncResult?.threats
            ? `Active AuraDB sync complete! Discovered ${auraSyncResult.threats.stealthHikes.length} silent price creeps and ${auraSyncResult.threats.duplicateSubs.length} cross-account duplicate subscriptions directly via Cypher.`
            : 'Modeled as Chained Time-Series events and Entity-Alias resolution to detect silent price creep and cross-account duplicates.'}
        </Text>
        
        <View style={styles.neo4jBtnGroup}>
          <TouchableOpacity
            style={styles.neo4jButtonPrimary}
            onPress={() => setIsAuraModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.neo4jButtonPrimaryText}>⚡ LIVE SYNC & THREAT AUDIT (AURA)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.neo4jButtonSecondary}
            onPress={() => setIsCypherModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.neo4jButtonSecondaryText}>📜 VIEW CYPHER STATEMENTS & SCHEMA</Text>
          </TouchableOpacity>
        </View>
      </View>

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
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '700',
    fontSize: 10,
    color: COLORS.ink,
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    fontSize: 12,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: COLORS.ink,
  },
  filterPillActiveDanger: {
    backgroundColor: '#FF3366',
  },
  filterPillText: {
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
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
    borderWidth: 2,
    borderColor: '#CCC',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyTitle: {
    fontSize: 12,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#666',
  },
  emptySubtitle: {
    fontSize: 10,
    fontFamily: BRUTALIST.fontMono,
    color: '#999',
    marginTop: 4,
  },
  aiCopilotCard: {
    backgroundColor: '#0F172A',
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.cyan,
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
    backgroundColor: COLORS.cyan,
    color: '#000',
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  aiCopilotStatus: {
    color: COLORS.cyan,
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '700',
  },
  aiCopilotTitle: {
    fontSize: 13,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
  },
  aiCopilotDesc: {
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontMono,
    color: '#CBD5E1',
    lineHeight: 14,
    marginBottom: 10,
  },
  aiCopilotButton: {
    backgroundColor: COLORS.cyan,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
    ...BRUTALIST.shadowSm,
  },
  aiCopilotButtonText: {
    color: '#000',
    fontSize: 10,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  neo4jCard: {
    backgroundColor: '#000000',
    borderWidth: BRUTALIST.borderWidth,
    borderColor: '#00E575',
    padding: 14,
    marginBottom: 20,
    ...BRUTALIST.shadowDefault,
  },
  neo4jTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  neo4jBadge: {
    backgroundColor: '#FFE600',
    color: '#000',
    fontSize: 8,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  neo4jBadgeLive: {
    backgroundColor: '#00E575',
  },
  neo4jStatus: {
    color: '#00E575',
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '700',
  },
  neo4jTitle: {
    fontSize: 14,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
  },
  neo4jDesc: {
    fontSize: 9,
    fontFamily: BRUTALIST.fontMono,
    color: '#CCC',
    lineHeight: 13,
    marginBottom: 12,
  },
  neo4jBtnGroup: {
    gap: 8,
  },
  neo4jButtonPrimary: {
    backgroundColor: '#FFE600',
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
    ...BRUTALIST.shadowSm,
  },
  neo4jButtonPrimaryText: {
    color: '#000',
    fontSize: 10,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  neo4jButtonSecondary: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  neo4jButtonSecondaryText: {
    color: '#000',
    fontSize: 9,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
