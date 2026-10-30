import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { AuraThreatResult } from '../../services/neo4jSync';

interface GraphVisualizerCardProps {
  threats?: AuraThreatResult | null;
  onOpenAuraModal: () => void;
  onOpenCypherModal: () => void;
}

export const GraphVisualizerCard: React.FC<GraphVisualizerCardProps> = ({
  threats,
  onOpenAuraModal,
  onOpenCypherModal,
}) => {
  const [selectedPath, setSelectedPath] = useState<'HIKE' | 'DUPLICATE' | 'TOPOLOGY'>('HIKE');

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>GRAPH INTELLIGENCE</Text>
          </View>
          <Text style={styles.title}>Neo4j Relationship Traversal</Text>
        </View>
        <TouchableOpacity style={styles.syncBtn} onPress={onOpenAuraModal} activeOpacity={0.8}>
          <Text style={styles.syncBtnText}>⚡ AURA SYNC</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Neo4j maps bank debits as an entity graph to uncover multi-account duplicates and stealth price creep that relational SQL cannot detect.
      </Text>

      {/* Traversal Selector Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, selectedPath === 'HIKE' && styles.tabActive]}
          onPress={() => setSelectedPath('HIKE')}
        >
          <Text style={[styles.tabText, selectedPath === 'HIKE' && styles.tabTextActive]}>
            📈 Price Creep Chain
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedPath === 'DUPLICATE' && styles.tabActive]}
          onPress={() => setSelectedPath('DUPLICATE')}
        >
          <Text style={[styles.tabText, selectedPath === 'DUPLICATE' && styles.tabTextActive]}>
            🔄 Cross-Card Dupes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedPath === 'TOPOLOGY' && styles.tabActive]}
          onPress={() => setSelectedPath('TOPOLOGY')}
        >
          <Text style={[styles.tabText, selectedPath === 'TOPOLOGY' && styles.tabTextActive]}>
            🕸️ Full Schema
          </Text>
        </TouchableOpacity>
      </View>

      {/* Visual Relationship Diagram */}
      <View style={styles.diagramContainer}>
        {selectedPath === 'HIKE' && (
          <View style={styles.pathBox}>
            <Text style={styles.pathHeadline}>TIME-SERIES DEBIT CHAIN PATTERN</Text>
            <View style={styles.chainRow}>
              <View style={[styles.node, styles.nodeMerchant]}>
                <Text style={styles.nodeLabel}>MERCHANT</Text>
                <Text style={styles.nodeValue}>Netflix</Text>
              </View>
              <Text style={styles.arrow}>[:BILLED] ➔</Text>
              <View style={[styles.node, styles.nodeEvent]}>
                <Text style={styles.nodeLabel}>EVENT (T1)</Text>
                <Text style={styles.nodeValue}>₹499</Text>
              </View>
              <Text style={styles.arrowHighlight}>[:NEXT_DEBIT] ➔</Text>
              <View style={[styles.node, styles.nodeEventHike]}>
                <Text style={styles.nodeLabel}>EVENT (T2)</Text>
                <Text style={styles.nodeValueHike}>₹649</Text>
              </View>
            </View>
            <View style={styles.threatFlag}>
              <Text style={styles.threatFlagText}>
                🚨 Cypher Rule: (t2.amount &gt; t1.amount) triggered silent +₹150 (+30%) price creep alert.
              </Text>
            </View>
          </View>
        )}

        {selectedPath === 'DUPLICATE' && (
          <View style={styles.pathBox}>
            <Text style={styles.pathHeadline}>MULTI-ACCOUNT CROSS-CARD TRAVERSAL</Text>
            <View style={styles.multiRow}>
              <View style={styles.accCol}>
                <View style={[styles.node, styles.nodeAcc]}>
                  <Text style={styles.nodeLabel}>ACCOUNT 1</Text>
                  <Text style={styles.nodeValue}>HDFC ••1234</Text>
                </View>
                <View style={[styles.node, styles.nodeAcc, { marginTop: 6 }]}>
                  <Text style={styles.nodeLabel}>ACCOUNT 2</Text>
                  <Text style={styles.nodeValue}>Axis ••5678</Text>
                </View>
              </View>
              <View style={styles.midArrows}>
                <Text style={styles.arrow}>[:HAS_MANDATE] ➔</Text>
                <Text style={styles.arrow}>[:HAS_MANDATE] ➔</Text>
              </View>
              <View style={[styles.node, styles.nodeMerchant, { justifyContent: 'center' }]}>
                <Text style={styles.nodeLabel}>SAME MERCHANT</Text>
                <Text style={styles.nodeValue}>Disney+ Hotstar</Text>
                <Text style={styles.dangerBadge}>2 CARDS BILLED</Text>
              </View>
            </View>
            <View style={styles.threatFlag}>
              <Text style={styles.threatFlagText}>
                🔄 Traversal Rule: count(DISTINCT Account) &gt; 1 per Merchant flagged duplicate subscription.
              </Text>
            </View>
          </View>
        )}

        {selectedPath === 'TOPOLOGY' && (
          <View style={styles.pathBox}>
            <Text style={styles.pathHeadline}>FINANCIAL KNOWLEDGE GRAPH ARCHITECTURE</Text>
            <View style={styles.topologySummary}>
              <Text style={styles.topoLine}>
                (User) ──[:OWNS]──► (Account) ──[:HAS_MANDATE]──► (Mandate)
              </Text>
              <Text style={styles.topoLine}>
                (Mandate) ──[:CHARGED_BY]──► (Merchant) ◄──[:RESOLVES_TO]── (RawDescriptor)
              </Text>
              <Text style={styles.topoLine}>
                (Mandate) ──[:BILLED]──► (DebitEvent) ──[:NEXT_DEBIT]──► (DebitEvent)
              </Text>
              <Text style={styles.topoLine}>
                (Mandate) ──[:CANCELLED_VIA]──► (CancellationPath: NPCI / RBI SIHub)
              </Text>
            </View>
            <TouchableOpacity style={styles.cypherLinkBtn} onPress={onOpenCypherModal}>
              <Text style={styles.cypherLinkText}>📜 VIEW CYPHER SPECIFICATION</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Live Metrics footer */}
      {threats && (
        <View style={styles.metricsFooter}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{threats.nodeCount || 46}</Text>
            <Text style={styles.metricLbl}>GRAPH NODES</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{threats.relCount || 68}</Text>
            <Text style={styles.metricLbl}>DIRECTED EDGES</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>
              {(threats.stealthHikes?.length || 0) + (threats.duplicateSubs?.length || 0)}
            </Text>
            <Text style={styles.metricLbl}>CYPHER THREATS</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    padding: 14,
    marginBottom: 16,
    ...BRUTALIST.shadowDefault,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tag: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.faintBorder,
  },
  tagText: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 9,
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 16,
    color: COLORS.ink,
  },
  syncBtn: {
    backgroundColor: COLORS.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 9.5,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: BRUTALIST.fontSans,
    fontSize: 11,
    color: COLORS.mutedText,
    lineHeight: 15,
    marginBottom: 12,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.faintBorder,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },
  tabText: {
    fontFamily: BRUTALIST.fontSansMedium,
    fontSize: 9.5,
    color: COLORS.ink,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontFamily: BRUTALIST.fontSansBold,
  },
  diagramContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.faintBorder,
    padding: 10,
    marginBottom: 8,
  },
  pathBox: {
    width: '100%',
  },
  pathHeadline: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 9,
    color: COLORS.mutedText,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  multiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  accCol: {
    flex: 1.2,
  },
  midArrows: {
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  node: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  nodeMerchant: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  nodeAcc: {
    backgroundColor: '#F3F4F6',
    borderColor: '#4B5563',
  },
  nodeEvent: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },
  nodeEventHike: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  nodeLabel: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 7.5,
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  nodeValue: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 11,
    color: COLORS.ink,
    marginTop: 1,
  },
  nodeValueHike: {
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '800',
    fontSize: 12,
    color: '#DC2626',
    marginTop: 1,
  },
  dangerBadge: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 7.5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
  },
  arrow: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 8.5,
    color: COLORS.mutedText,
    fontWeight: '700',
  },
  arrowHighlight: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 8.5,
    color: '#DC2626',
    fontWeight: '800',
  },
  threatFlag: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    padding: 6,
  },
  threatFlagText: {
    fontFamily: BRUTALIST.fontSans,
    fontSize: 10,
    color: '#991B1B',
    lineHeight: 14,
  },
  topologySummary: {
    gap: 4,
    marginBottom: 8,
  },
  topoLine: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 8.5,
    color: COLORS.ink,
    lineHeight: 12,
  },
  cypherLinkBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  cypherLinkText: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 9.5,
    color: '#2563EB',
  },
  metricsFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: COLORS.faintBorder,
    paddingTop: 8,
    marginTop: 4,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '800',
    fontSize: 16,
    color: COLORS.ink,
  },
  metricLbl: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 8,
    color: COLORS.mutedText,
    marginTop: 1,
  },
});
