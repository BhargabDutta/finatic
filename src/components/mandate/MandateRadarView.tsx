import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { Mandate, ThreatType, MandateRadarStats } from '../../types/mandate';
import { auditSyntheticStatement } from '../../services/mandateGraphEngine';
import { generateCypherSeedScript } from '../../services/neo4jSync';
import { AnnualBleedCard } from './AnnualBleedCard';
import { MandateCard } from './MandateCard';
import { CancellationModal } from './CancellationModal';

type FilterType = 'ALL' | 'THREATS' | 'PRICE_CREEP' | 'TRIAL_TRAP' | 'DOUBLE_SUBSCRIPTION' | 'ZOMBIE_CHARGE';

export const MandateRadarView: React.FC = () => {
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [stats, setStats] = useState<MandateRadarStats | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [activeMandateForCancel, setActiveMandateForCancel] = useState<Mandate | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  // Run initial synthetic statement audit
  const runAudit = useCallback(() => {
    setIsAuditing(true);
    setTimeout(() => {
      const { mandates: auditedMandates, stats: auditedStats } = auditSyntheticStatement();
      setMandates(auditedMandates);
      setStats(auditedStats);
      setIsAuditing(false);
    }, 400);
  }, []);

  useEffect(() => {
    runAudit();
  }, [runAudit]);

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

  const showNeo4jScriptInfo = () => {
    Alert.alert(
      'Neo4j Knowledge Graph Seed',
      `Graph Schema Generated!\n\n• 53 Nodes (User, Accounts, Mandates, Merchants, Events)\n• 68 Directed Edges\n\nThe script is saved at:\nscripts/seed-neo4j.cypher\n\nRun this in Neo4j Browser or Bloom to see the live glowing graph!`,
      [{ text: 'OK' }]
    );
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
            />
          ))
        )}
      </View>

      {/* Neo4j Graph Showcase Card */}
      <View style={styles.neo4jCard}>
        <View style={styles.neo4jTop}>
          <Text style={styles.neo4jBadge}>NEO4J GRAPH ENGINE</Text>
          <Text style={styles.neo4jStatus}>CONNECTED // 53 NODES</Text>
        </View>
        <Text style={styles.neo4jTitle}>FINANCIAL KNOWLEDGE GRAPH</Text>
        <Text style={styles.neo4jDesc}>
          Modeled as Chained Time-Series events and Entity-Alias resolution to detect silent price creep and cross-account duplicates.
        </Text>
        <TouchableOpacity style={styles.neo4jButton} onPress={showNeo4jScriptInfo}>
          <Text style={styles.neo4jButtonText}>🕸️ VIEW GRAPH CYPHER SPECIFICATION</Text>
        </TouchableOpacity>
      </View>

      {/* Cancellation Runbook Modal */}
      <CancellationModal
        visible={isCancelModalOpen}
        mandate={activeMandateForCancel}
        onClose={() => setIsCancelModalOpen(false)}
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
    backgroundColor: '#00E575',
    color: '#000',
    fontSize: 8,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
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
    marginBottom: 10,
  },
  neo4jButton: {
    backgroundColor: '#00E575',
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  neo4jButtonText: {
    color: '#000',
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
