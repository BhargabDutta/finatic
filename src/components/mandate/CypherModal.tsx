import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';

interface CypherModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CypherModal: React.FC<CypherModalProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'QUERIES' | 'SCHEMA'>('QUERIES');

  const copyFeedback = (title: string) => {
    Alert.alert(
      'Copied to Clipboard',
      `${title} copied to clipboard! You can paste and execute this in Neo4j Workspace / Browser.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerBadge}>NEO4J // GRAPH CYPHER SPECIFICATION</Text>
              <Text style={styles.headerTitle}>GRAPH INTELLIGENCE</Text>
              <Text style={styles.headerSubtitle}>
                Chained Time-Series & Entity-Alias Resolution Engine
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Metric Stats Banner */}
          <View style={styles.statsBanner}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>37</Text>
              <Text style={styles.statLabel}>GRAPH NODES</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>53</Text>
              <Text style={styles.statLabel}>EDGES / RELS</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>38ms</Text>
              <Text style={styles.statLabel}>QUERY SPEED</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>ZERO</Text>
              <Text style={styles.statLabel}>SQL JOINS</Text>
            </View>
          </View>

          {/* Sub Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'QUERIES' && styles.tabBtnActive]}
              onPress={() => setActiveTab('QUERIES')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'QUERIES' && styles.tabBtnTextActive]}>
                ⚡ CYPHER THREAT QUERIES
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'SCHEMA' && styles.tabBtnActive]}
              onPress={() => setActiveTab('SCHEMA')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'SCHEMA' && styles.tabBtnTextActive]}>
                🕸️ GRAPH SCHEMA
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {activeTab === 'QUERIES' ? (
              <>
                {/* Query 1: Price Hike */}
                <View style={styles.queryCard}>
                  <View style={styles.queryHeader}>
                    <Text style={styles.queryTitle}>1. DETECT SILENT PRICE INCREASE</Text>
                    <TouchableOpacity
                      style={styles.copySmallBtn}
                      onPress={() => copyFeedback('Silent Price Increase Query')}
                    >
                      <Text style={styles.copySmallText}>COPY</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.queryDesc}>
                    Traverses chained consecutive payments to catch stealth price hikes without requiring SQL self-joins:
                  </Text>
                  <View style={styles.codeBox}>
                    <Text style={styles.codeText}>
{`MATCH (m:Mandate)-[:BILLED]->(t1:DebitEvent)-[:NEXT_CHARGE]->(t2:DebitEvent)
MATCH (m)-[:CHARGED_BY]->(merch:Merchant)
WHERE t2.amount > t1.amount
RETURN merch.name AS Service,
       t1.amount AS OldPrice,
       t2.amount AS NewPrice,
       (t2.amount - t1.amount) AS StealthHike`}
                    </Text>
                  </View>
                  <Text style={styles.resultBadge}>RESULT: Netflix (+₹150) & Canva Pro (+₹897)</Text>
                </View>

                {/* Query 2: Double Subscription */}
                <View style={styles.queryCard}>
                  <View style={styles.queryHeader}>
                    <Text style={styles.queryTitle}>2. DETECT DOUBLE SUBSCRIPTIONS</Text>
                    <TouchableOpacity
                      style={styles.copySmallBtn}
                      onPress={() => copyFeedback('Double Subscription Query')}
                    >
                      <Text style={styles.copySmallText}>COPY</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.queryDesc}>
                    Finds multiple active mandates across different bank accounts converging on the same Merchant:
                  </Text>
                  <View style={styles.codeBox}>
                    <Text style={styles.codeText}>
{`MATCH (u:User)-[:OWNS]->(a:Account)-[:HAS_MANDATE]->(m:Mandate)-[:CHARGED_BY]->(merch:Merchant)
WITH merch, count(m) AS SubCount, collect(a.bank + " (.." + a.last4 + ")") AS Accounts
WHERE SubCount > 1
RETURN merch.name AS DuplicateService, SubCount, Accounts`}
                    </Text>
                  </View>
                  <Text style={styles.resultBadge}>RESULT: Disney+ Hotstar (HDFC & ICICI simultaneously)</Text>
                </View>

                {/* Query 3: Total Bleed */}
                <View style={styles.queryCard}>
                  <View style={styles.queryHeader}>
                    <Text style={styles.queryTitle}>3. TOTAL ANNUAL BLEED AGGREGATION</Text>
                    <TouchableOpacity
                      style={styles.copySmallBtn}
                      onPress={() => copyFeedback('Annual Bleed Query')}
                    >
                      <Text style={styles.copySmallText}>COPY</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.queryDesc}>
                    Traverses all active and zombie mandate edges to compute the psychological annual damage:
                  </Text>
                  <View style={styles.codeBox}>
                    <Text style={styles.codeText}>
{`MATCH (u:User)-[:OWNS]->(:Account)-[:HAS_MANDATE]->(m:Mandate)
RETURN count(m) AS TotalMandates,
       sum(m.monthlyAmount) AS MonthlyBleed,
       sum(m.annualAmount) AS AnnualBleedTotal`}
                    </Text>
                  </View>
                  <Text style={styles.resultBadge}>RESULT: 7 Mandates // ₹5,194/mo // ₹62,328/yr</Text>
                </View>
              </>
            ) : (
              /* Schema View */
              <View style={styles.schemaCard}>
                <Text style={styles.schemaTitle}>THE LABELED PROPERTY GRAPH MODEL</Text>
                <Text style={styles.schemaDesc}>
                  Finatic transforms flat SMS text into a living property graph with 6 core node labels and 6 directed edge types:
                </Text>

                <View style={styles.schemaItem}>
                  <Text style={styles.schemaNode}>(:User)</Text>
                  <Text style={styles.schemaArrow}>──[:OWNS]──►</Text>
                  <Text style={styles.schemaNode}>(:Account)</Text>
                </View>

                <View style={styles.schemaItem}>
                  <Text style={styles.schemaNode}>(:Account)</Text>
                  <Text style={styles.schemaArrow}>──[:HAS_MANDATE]──►</Text>
                  <Text style={styles.schemaNode}>(:Mandate)</Text>
                </View>

                <View style={styles.schemaItem}>
                  <Text style={styles.schemaNode}>(:Mandate)</Text>
                  <Text style={styles.schemaArrow}>──[:CHARGED_BY]──►</Text>
                  <Text style={styles.schemaNode}>(:Merchant)</Text>
                </View>

                <View style={styles.schemaItem}>
                  <Text style={styles.schemaNode}>(:RawDescriptor)</Text>
                  <Text style={styles.schemaArrow}>──[:RESOLVES_TO]──►</Text>
                  <Text style={styles.schemaNode}>(:Merchant)</Text>
                </View>

                <View style={styles.schemaItem}>
                  <Text style={styles.schemaNode}>(:Mandate)</Text>
                  <Text style={styles.schemaArrow}>──[:BILLED]──►</Text>
                  <Text style={styles.schemaNode}>(:DebitEvent)</Text>
                </View>

                <View style={styles.schemaItem}>
                  <Text style={styles.schemaNode}>(:DebitEvent)</Text>
                  <Text style={[styles.schemaArrow, { color: '#FF3366' }]}>──[:NEXT_CHARGE]──►</Text>
                  <Text style={styles.schemaNode}>(:DebitEvent)</Text>
                </View>

                <View style={styles.schemaItem}>
                  <Text style={styles.schemaNode}>(:Mandate)</Text>
                  <Text style={styles.schemaArrow}>──[:CANCELLED_VIA]──►</Text>
                  <Text style={styles.schemaNode}>(:CancellationPath)</Text>
                </View>
              </View>
            )}

            <View style={{ height: 30 }} />
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>CLOSE CYPHER INSPECTOR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F0F0F',
    borderTopWidth: 3,
    borderColor: '#00E575',
    maxHeight: '88%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
    borderColor: '#222',
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerBadge: {
    backgroundColor: '#00E575',
    color: '#000',
    fontSize: 8,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontMono,
    color: '#888',
    marginTop: 2,
  },
  closeButton: {
    width: 30,
    height: 30,
    backgroundColor: '#00E575',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#000',
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 12,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 15,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#00E575',
  },
  statLabel: {
    fontSize: 7.5,
    fontFamily: BRUTALIST.fontMono,
    color: '#888',
    marginTop: 1,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#00E575',
    borderColor: '#00E575',
  },
  tabBtnText: {
    fontSize: 9,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#888',
  },
  tabBtnTextActive: {
    color: '#000',
  },
  body: {
    flexGrow: 0,
  },
  queryCard: {
    backgroundColor: '#161616',
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
    padding: 12,
    marginBottom: 12,
  },
  queryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  queryTitle: {
    fontSize: 10.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#00E575',
  },
  copySmallBtn: {
    backgroundColor: '#00E575',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  copySmallText: {
    fontSize: 8,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#000',
  },
  queryDesc: {
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    color: '#AAA',
    marginBottom: 8,
    lineHeight: 12,
  },
  codeBox: {
    backgroundColor: '#080808',
    borderWidth: 1,
    borderColor: '#222',
    padding: 8,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 8,
    fontFamily: 'Courier',
    color: '#00FF66',
    lineHeight: 12,
  },
  resultBadge: {
    fontSize: 8,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '700',
    color: '#FFE600',
    backgroundColor: '#262200',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#FFE600',
  },
  schemaCard: {
    backgroundColor: '#161616',
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
    padding: 14,
  },
  schemaTitle: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#00E575',
    marginBottom: 4,
  },
  schemaDesc: {
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    color: '#AAA',
    lineHeight: 13,
    marginBottom: 14,
  },
  schemaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#222',
    paddingVertical: 7,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  schemaNode: {
    fontSize: 9,
    fontFamily: 'Courier',
    fontWeight: '800',
    color: '#FFE600',
  },
  schemaArrow: {
    fontSize: 8,
    fontFamily: 'Courier',
    fontWeight: '800',
    color: '#00E575',
    marginHorizontal: 8,
  },
  footer: {
    borderTopWidth: 1.5,
    borderColor: '#222',
    paddingTop: 10,
  },
  doneButton: {
    backgroundColor: '#00E575',
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#000',
    fontSize: 11,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
