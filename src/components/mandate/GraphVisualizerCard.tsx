import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
          <Ionicons name="sync-outline" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
          <Text style={styles.syncBtnText}>AURA SYNC</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Graph entity traversal connects cross-card duplicates and silent price hikes invisible to traditional relational databases.
      </Text>

      {/* Traversal Selector Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, selectedPath === 'HIKE' && styles.tabActive]}
          onPress={() => setSelectedPath('HIKE')}
        >
          <Ionicons
            name="trending-up-outline"
            size={12}
            color={selectedPath === 'HIKE' ? '#FFFFFF' : '#111827'}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabText, selectedPath === 'HIKE' && styles.tabTextActive]}>
            Price Hike Chain
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedPath === 'DUPLICATE' && styles.tabActive]}
          onPress={() => setSelectedPath('DUPLICATE')}
        >
          <Ionicons
            name="copy-outline"
            size={12}
            color={selectedPath === 'DUPLICATE' ? '#FFFFFF' : '#111827'}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabText, selectedPath === 'DUPLICATE' && styles.tabTextActive]}>
            Cross-Card Dupes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedPath === 'TOPOLOGY' && styles.tabActive]}
          onPress={() => setSelectedPath('TOPOLOGY')}
        >
          <Ionicons
            name="git-branch-outline"
            size={12}
            color={selectedPath === 'TOPOLOGY' ? '#FFFFFF' : '#111827'}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabText, selectedPath === 'TOPOLOGY' && styles.tabTextActive]}>
            Graph Schema
          </Text>
        </TouchableOpacity>
      </View>

      {/* Visual Relationship Diagram */}
      <View style={styles.diagramContainer}>
        {selectedPath === 'HIKE' && (
          <View style={styles.pathBox}>
            <Text style={styles.pathHeadline}>TIME-SERIES DEBIT CHAIN</Text>
            <View style={styles.chainRow}>
              <View style={[styles.node, styles.nodeMerchant]}>
                <Text style={styles.nodeLabel}>MERCHANT</Text>
                <Text style={styles.nodeValue}>Netflix</Text>
              </View>
              <Text style={styles.arrow}>[:BILLED] ➔</Text>
              <View style={[styles.node, styles.nodeEvent]}>
                <Text style={styles.nodeLabel}>CYCLE 1</Text>
                <Text style={styles.nodeValue}>₹499</Text>
              </View>
              <Text style={styles.arrowHighlight}>[:NEXT_DEBIT] ➔</Text>
              <View style={[styles.node, styles.nodeEventHike]}>
                <Text style={styles.nodeLabel}>CYCLE 2</Text>
                <Text style={styles.nodeValueHike}>₹649</Text>
              </View>
            </View>
            <View style={styles.threatFlag}>
              <Ionicons name="warning-outline" size={12} color="#DC2626" style={{ marginRight: 4 }} />
              <Text style={styles.threatFlagText}>
                Rule (t2.amount &gt; t1.amount) triggered +₹150 rate hike alert.
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
                <Text style={styles.nodeLabel}>MERCHANT</Text>
                <Text style={styles.nodeValue}>Disney+ Hotstar</Text>
                <Text style={styles.dangerBadge}>2 CARDS CHARGED</Text>
              </View>
            </View>
            <View style={styles.threatFlag}>
              <Ionicons name="copy-outline" size={12} color="#DC2626" style={{ marginRight: 4 }} />
              <Text style={styles.threatFlagText}>
                Multiple distinct accounts linked to the same service.
              </Text>
            </View>
          </View>
        )}

        {selectedPath === 'TOPOLOGY' && (
          <View style={styles.pathBox}>
            <Text style={styles.pathHeadline}>KNOWLEDGE GRAPH ARCHITECTURE</Text>
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
            </View>
            <TouchableOpacity style={styles.cypherLinkBtn} onPress={onOpenCypherModal}>
              <Ionicons name="document-text-outline" size={12} color="#111827" style={{ marginRight: 4 }} />
              <Text style={styles.cypherLinkText}>VIEW CYPHER SPECIFICATION</Text>
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
    padding: 13,
    marginBottom: 14,
    ...BRUTALIST.shadowDefault,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  tag: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 3,
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
    fontSize: 14,
    fontFamily: BRUTALIST.fontSansBold,
    color: COLORS.ink,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ink,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
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
    marginBottom: 10,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: COLORS.ink,
  },
  tabActive: {
    backgroundColor: COLORS.ink,
  },
  tabText: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 10,
    color: COLORS.ink,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  diagramContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    marginBottom: 6,
  },
  pathBox: {
    alignItems: 'center',
  },
  pathHeadline: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.mutedText,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 4,
  },
  node: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minWidth: 64,
  },
  nodeMerchant: {
    borderColor: '#1D4ED8',
    backgroundColor: '#EFF6FF',
  },
  nodeEvent: {
    borderColor: '#374151',
    backgroundColor: '#FFFFFF',
  },
  nodeEventHike: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  nodeAcc: {
    borderColor: '#4B5563',
    backgroundColor: '#F3F4F6',
  },
  nodeLabel: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 7.5,
    color: '#6B7280',
    fontWeight: '700',
  },
  nodeValue: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 11,
    color: COLORS.ink,
  },
  nodeValueHike: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 11,
    color: '#DC2626',
  },
  arrow: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 8.5,
    color: '#6B7280',
    fontWeight: '700',
  },
  arrowHighlight: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 8.5,
    color: '#DC2626',
    fontWeight: '800',
  },
  threatFlag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    width: '100%',
  },
  threatFlagText: {
    flex: 1,
    fontFamily: BRUTALIST.fontSans,
    fontSize: 10.5,
    color: '#DC2626',
    fontWeight: '600',
  },
  multiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  accCol: {
    gap: 4,
  },
  midArrows: {
    alignItems: 'center',
    gap: 8,
  },
  dangerBadge: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 8,
    color: '#DC2626',
    marginTop: 2,
  },
  topologySummary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 8,
    width: '100%',
    gap: 4,
  },
  topoLine: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 8.5,
    color: '#374151',
  },
  cypherLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.ink,
    backgroundColor: '#FFFFFF',
  },
  cypherLinkText: {
    fontFamily: BRUTALIST.fontSansBold,
    fontSize: 9.5,
    color: COLORS.ink,
  },
  metricsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.faintBorder,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.ink,
  },
  metricLbl: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 8.5,
    color: COLORS.mutedText,
    marginTop: 1,
  },
});
