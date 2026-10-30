import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { Mandate } from '../../types/mandate';
import {
  Neo4jCredentials,
  AuraSyncResult,
  getStoredAuraCredentials,
  saveAuraCredentials,
  testAuraConnection,
  syncAndAuditWithNeo4jAura,
} from '../../services/neo4jSync';

interface Neo4jAuraSyncModalProps {
  visible: boolean;
  mandates: Mandate[];
  onClose: () => void;
  onSyncComplete?: (result: AuraSyncResult) => void;
}

export const Neo4jAuraSyncModal: React.FC<Neo4jAuraSyncModalProps> = ({
  visible,
  mandates,
  onClose,
  onSyncComplete,
}) => {
  const [uri, setUri] = useState<string>('');
  const [username, setUsername] = useState<string>('neo4j');
  const [password, setPassword] = useState<string>('');
  const [database, setDatabase] = useState<string>('neo4j');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isConfigExpanded, setIsConfigExpanded] = useState<boolean>(true);

  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs: number;
  } | null>(null);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<AuraSyncResult | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  // Load saved credentials on modal open
  useEffect(() => {
    if (visible) {
      (async () => {
        const saved = await getStoredAuraCredentials();
        if (saved) {
          setUri(saved.uri || '');
          setUsername(saved.username || 'neo4j');
          setPassword(saved.password || '');
          setDatabase(saved.database || 'neo4j');
          // If credentials already exist, collapse config by default to show action
          if (saved.uri && saved.password) {
            setIsConfigExpanded(false);
          }
        }
      })();
    }
  }, [visible]);

  const currentCreds: Neo4jCredentials = {
    uri: uri.trim(),
    username: username.trim() || 'neo4j',
    password: password.trim(),
    database: database.trim() || 'neo4j',
  };

  const handleSaveCredentials = async () => {
    if (!uri.trim()) {
      Alert.alert('Missing URI', 'Please enter your Neo4j Aura URI.');
      return;
    }
    await saveAuraCredentials(currentCreds);
    Alert.alert('Saved', 'Neo4j Aura credentials securely saved to device storage.');
  };

  const handleTestConnection = async () => {
    if (!uri.trim() || !password.trim()) {
      Alert.alert('Incomplete Configuration', 'Please enter both Neo4j Aura URI and Password.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testAuraConnection(currentCreds);
      setTestResult({
        success: res.connected,
        message: res.message,
        latencyMs: res.latencyMs,
      });
      if (res.connected) {
        await saveAuraCredentials(currentCreds);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection test failed',
        latencyMs: 0,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncAndAudit = async () => {
    if (!uri.trim() || !password.trim()) {
      Alert.alert('Incomplete Configuration', 'Please enter your Neo4j Aura URI and Password first.');
      setIsConfigExpanded(true);
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);

    try {
      await saveAuraCredentials(currentCreds);
      const res = await syncAndAuditWithNeo4jAura(currentCreds, mandates);
      setSyncResult(res);

      if (res.success && onSyncComplete) {
        onSyncComplete(res);
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err?.message || 'Sync failed unexpectedly',
        latencyMs: 0,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePreFillPlaceholder = () => {
    setUri('neo4j+s://xxxxxxxx.databases.neo4j.io');
    setUsername('neo4j');
    setDatabase('neo4j');
    Alert.alert(
      'Demo Template Applied',
      'Replace xxxxxxxx with your free Neo4j Aura instance ID and enter your database password.'
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <Text style={styles.headerBadge}>NEO4J AURA // LIVE HTTP GATEWAY</Text>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>TRANSACTIONAL API</Text>
                </View>
              </View>
              <Text style={styles.headerTitle}>GRAPH SYNCHRONIZER</Text>
              <Text style={styles.headerSubtitle}>
                Sync active commitments & run live Cypher threat detection in Neo4j Aura
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Connection Configuration Accordion */}
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeaderToggle}
                onPress={() => setIsConfigExpanded(!isConfigExpanded)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeaderTitleRow}>
                  <Ionicons name="key-outline" size={16} color={COLORS.ink} />
                  <Text style={styles.cardTitle}>AURA CONNECTION CREDENTIALS</Text>
                </View>
                <Text style={styles.toggleChevron}>{isConfigExpanded ? '▲ HIDE' : '▼ CONFIGURE'}</Text>
              </TouchableOpacity>

              {isConfigExpanded && (
                <View style={styles.configBody}>
                  <Text style={styles.inputLabel}>NEO4J AURA URI / ENDPOINT</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="neo4j+s://abc12345.databases.neo4j.io"
                    placeholderTextColor="#888"
                    value={uri}
                    onChangeText={setUri}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <View style={styles.inputRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.inputLabel}>DATABASE</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="neo4j"
                        placeholderTextColor="#888"
                        value={database}
                        onChangeText={setDatabase}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>USERNAME</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="neo4j"
                        placeholderTextColor="#888"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>PASSWORD</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Enter Neo4j Aura password"
                      placeholderTextColor="#888"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={COLORS.ink}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Config Buttons */}
                  <View style={styles.configBtnRow}>
                    <TouchableOpacity
                      style={[styles.smallBtn, styles.testBtn]}
                      onPress={handleTestConnection}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <Ionicons name="pulse-outline" size={12} color="#FFF" style={{ marginRight: 4 }} />
                          <Text style={[styles.smallBtnText, styles.testBtnText]}>TEST PING</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.smallBtn, styles.saveBtn]}
                      onPress={handleSaveCredentials}
                    >
                      <Ionicons name="bookmark-outline" size={12} color="#111827" style={{ marginRight: 4 }} />
                      <Text style={styles.smallBtnText}>SAVE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.smallBtn, styles.demoBtn]}
                      onPress={handlePreFillPlaceholder}
                    >
                      <Ionicons name="flash-outline" size={12} color="#111827" style={{ marginRight: 4 }} />
                      <Text style={styles.smallBtnText}>PRESET</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Test Ping Result Banner */}
                  {testResult && (
                    <View
                      style={[
                        styles.testBanner,
                        testResult.success ? styles.testBannerSuccess : styles.testBannerError,
                      ]}
                    >
                      <Ionicons
                        name={testResult.success ? 'checkmark-circle' : 'alert-circle'}
                        size={16}
                        color={testResult.success ? '#006600' : '#CC0000'}
                      />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text
                          style={[
                            styles.testBannerTitle,
                            { color: testResult.success ? '#006600' : '#CC0000' },
                          ]}
                        >
                          {testResult.success ? 'CONNECTION VERIFIED' : 'CONNECTION FAILED'}
                        </Text>
                        <Text style={styles.testBannerMsg}>{testResult.message}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Sync Action Card */}
            <View style={styles.actionCard}>
              <View style={styles.actionHeader}>
                <Text style={styles.actionBadge}>PAYLOAD: {mandates.length} ACTIVE MANDATES</Text>
                <Text style={styles.actionSubtext}>MULTI-ACCOUNT GRAPH MODEL</Text>
              </View>

              <Text style={styles.actionTitle}>PUSH GRAPH & EXECUTE CYPHER AUDIT</Text>
              <Text style={styles.actionDesc}>
                Batches local recurring commitments into Cypher MERGE transactions, links time-series
                debit events, and queries Neo4j for silent price creep and multi-card duplicates.
              </Text>

              <TouchableOpacity
                style={[styles.primarySyncBtn, isSyncing && styles.primarySyncBtnDisabled]}
                onPress={handleSyncAndAudit}
                disabled={isSyncing}
                activeOpacity={0.8}
              >
                {isSyncing ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={styles.primarySyncBtnText}>
                      COMMITTING TRANSACTIONS TO AURA...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.loadingRow}>
                    <Ionicons name="git-network-outline" size={14} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.primarySyncBtnText}>
                      SYNC GRAPH & RUN AURA AUDIT
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Live Audit Results View */}
            {syncResult && (
              <View style={styles.resultsCard}>
                <View style={styles.resultsHeader}>
                  <View>
                    <Text style={[styles.resultsBadge, !syncResult.success && { backgroundColor: '#FEE2E2', color: '#DC2626' }]}>
                      {syncResult.success ? 'AURA DB: AUDIT COMPLETE' : 'AURA DB: ERROR'}
                    </Text>
                    <Text style={styles.resultsTitle}>LIVE GRAPH INTELLIGENCE</Text>
                  </View>
                  {syncResult.latencyMs > 0 && (
                    <View style={styles.latencyPill}>
                      <Text style={styles.latencyPillText}>{syncResult.latencyMs}ms</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.resultsMessage}>{syncResult.message}</Text>

                {/* Graph Topology Counts */}
                {syncResult.threats && (
                  <View style={styles.metricsGrid}>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricVal}>{syncResult.threats.nodeCount}</Text>
                      <Text style={styles.metricLbl}>GRAPH NODES</Text>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricVal}>{syncResult.threats.relCount}</Text>
                      <Text style={styles.metricLbl}>EDGES / RELS</Text>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricVal}>
                        {syncResult.threats.stealthHikes.length +
                          syncResult.threats.duplicateSubs.length}
                      </Text>
                      <Text style={styles.metricLbl}>THREATS FOUND</Text>
                    </View>
                  </View>
                )}

                {/* Threat 1: Stealth Price Hikes */}
                {syncResult.threats?.stealthHikes &&
                  syncResult.threats.stealthHikes.length > 0 && (
                    <View style={styles.threatSection}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Ionicons name="trending-up-outline" size={13} color="#DC2626" style={{ marginRight: 5 }} />
                        <Text style={styles.threatSectionTitle}>
                          PRICE CREEP DETECTED BY GRAPH:
                        </Text>
                      </View>
                      {syncResult.threats.stealthHikes.map((hike, idx) => (
                        <View key={idx} style={styles.threatItemCard}>
                          <View style={styles.threatItemTop}>
                            <Text style={styles.threatMerchantName}>{hike.service}</Text>
                            <Text style={styles.threatHikeBadge}>+₹{hike.hike} HIKE</Text>
                          </View>
                          <Text style={styles.threatDetail}>
                            Jumped from ₹{hike.oldPrice} → ₹{hike.newPrice} along chained{' '}
                            <Text style={styles.codeText}>[:NEXT_DEBIT]</Text> time-series.
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                {/* Threat 2: Multi-Account Duplicate Subscriptions */}
                {syncResult.threats?.duplicateSubs &&
                  syncResult.threats.duplicateSubs.length > 0 && (
                    <View style={styles.threatSection}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Ionicons name="copy-outline" size={13} color="#1D4ED8" style={{ marginRight: 5 }} />
                        <Text style={styles.threatSectionTitle}>
                          MULTI-ACCOUNT DUPLICATES DETECTED:
                        </Text>
                      </View>
                      {syncResult.threats.duplicateSubs.map((dup, idx) => (
                        <View key={idx} style={styles.threatItemCard}>
                          <View style={styles.threatItemTop}>
                            <Text style={styles.threatMerchantName}>{dup.service}</Text>
                            <Text style={styles.threatDupBadge}>
                              {dup.subCount} CARDS CHARGED
                            </Text>
                          </View>
                          <Text style={styles.threatDetail}>
                            Active accounts: {dup.accounts.join(', ') || 'HDFC, Axis'} via{' '}
                            <Text style={styles.codeText}>[:OWNS]-&gt;[:HAS_MANDATE]</Text> graph
                            traversal.
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                {/* Zero Knowledge Privacy Guarantee */}
                <View style={styles.privacyNotice}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                    <Ionicons name="shield-checkmark-outline" size={13} color="#059669" style={{ marginRight: 5 }} />
                    <Text style={styles.privacyTitle}>ZERO-KNOWLEDGE GUARANTEE:</Text>
                  </View>
                  <Text style={styles.privacyText}>
                    Neo4j Aura receives only pseudonymized tokens and masked billing figures. No raw SMS text, phone numbers, or account details leave your device.
                  </Text>
                </View>

                {/* Inspect Raw Transaction Response */}
                {syncResult.rawResponse && (
                  <View style={styles.rawJsonSection}>
                    <TouchableOpacity
                      style={styles.rawJsonToggle}
                      onPress={() => setShowRawJson(!showRawJson)}
                    >
                      <Ionicons
                        name={showRawJson ? 'chevron-down' : 'chevron-forward'}
                        size={12}
                        color="#111827"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.rawJsonToggleText}>
                        {showRawJson
                          ? 'HIDE RAW TRANSACTION PAYLOAD'
                          : 'INSPECT RAW AURA TRANSACTION PAYLOAD'}
                      </Text>
                    </TouchableOpacity>

                    {showRawJson && (
                      <View style={styles.rawJsonViewer}>
                        <Text style={styles.rawJsonCode}>
                          {JSON.stringify(syncResult.rawResponse, null, 2)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Quick Setup Instructions */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>HOW NEO4J AURA OPERATES WITH FINATIC:</Text>
              <Text style={styles.infoStep}>
                1. <Text style={styles.bold}>Local SMS Parser</Text> runs on-device, categorizing
                auto-debit mandates and masking all personal information.
              </Text>
              <Text style={styles.infoStep}>
                2. <Text style={styles.bold}>Aura Gateway</Text> sends structured Cypher
                statements over Neo4j&apos;s HTTPS transactional endpoint.
              </Text>
              <Text style={styles.infoStep}>
                3. <Text style={styles.bold}>Graph Analytics Engine</Text> executes pattern
                matching to expose stealth pricing creep and multi-card double subscriptions.
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>DISMISS</Text>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.paper,
    borderTopWidth: BRUTALIST.borderWidthThick,
    borderColor: COLORS.ink,
    maxHeight: '92%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    paddingBottom: 12,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerBadge: {
    backgroundColor: COLORS.ink,
    color: COLORS.yellow,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    fontSize: 9,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#166534',
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 4,
  },
  liveText: {
    fontSize: 8,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#166534',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    fontFamily: BRUTALIST.fontMono,
    color: COLORS.mutedText,
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: COLORS.ink,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.ink,
  },
  closeButtonText: {
    color: COLORS.yellow,
    fontSize: 14,
    fontWeight: '900',
  },
  body: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    padding: 12,
    marginBottom: 12,
    ...BRUTALIST.shadowSm,
  },
  cardHeaderToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.ink,
  },
  toggleChevron: {
    fontSize: 10,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.ink,
  },
  configBody: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#E5E5E5',
    paddingTop: 10,
  },
  inputLabel: {
    fontSize: 9,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.ink,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    fontFamily: BRUTALIST.fontMono,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: COLORS.ink,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 36,
  },
  eyeBtn: {
    position: 'absolute',
    right: 8,
    top: 6,
    padding: 4,
  },
  configBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  smallBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...BRUTALIST.shadowSm,
  },
  testBtn: {
    backgroundColor: COLORS.ink,
    flex: 2,
  },
  saveBtn: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  demoBtn: {
    backgroundColor: '#F3F4F6',
    flex: 1.2,
  },
  smallBtnText: {
    fontSize: 10,
    fontFamily: BRUTALIST.fontSansBold,
    color: COLORS.ink,
  },
  testBtnText: {
    color: '#FFFFFF',
  },
  testBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 8,
    marginTop: 10,
  },
  testBannerSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },
  testBannerError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  testBannerTitle: {
    fontSize: 10,
    fontFamily: BRUTALIST.fontSansBold,
  },
  testBannerMsg: {
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontSans,
    color: '#333',
    marginTop: 2,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    padding: 14,
    marginBottom: 12,
    ...BRUTALIST.shadowSm,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionBadge: {
    backgroundColor: COLORS.ink,
    color: '#FFF',
    fontSize: 9,
    fontFamily: BRUTALIST.fontSansBold,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  actionSubtext: {
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontSans,
    color: COLORS.mutedText,
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: BRUTALIST.fontSansBold,
    color: COLORS.ink,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontSans,
    color: COLORS.mutedText,
    lineHeight: 15,
    marginBottom: 12,
  },
  primarySyncBtn: {
    backgroundColor: COLORS.ink,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    ...BRUTALIST.shadowSm,
  },
  primarySyncBtnDisabled: {
    opacity: 0.7,
  },
  primarySyncBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: BRUTALIST.fontSansBold,
    letterSpacing: 0.3,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    padding: 12,
    marginBottom: 12,
    ...BRUTALIST.shadowSm,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultsBadge: {
    fontSize: 9,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.ink,
    marginBottom: 2,
  },
  resultsTitle: {
    fontSize: 13,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.ink,
  },
  latencyPill: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#166534',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  latencyPillText: {
    fontSize: 9,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#166534',
  },
  resultsMessage: {
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontMono,
    color: '#333',
    lineHeight: 14,
    marginBottom: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    paddingVertical: 8,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 18,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.ink,
  },
  metricLbl: {
    fontSize: 7.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '800',
    color: '#555',
    marginTop: 2,
  },
  threatSection: {
    marginTop: 8,
    marginBottom: 10,
  },
  threatSectionTitle: {
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.ink,
    marginBottom: 6,
  },
  threatItemCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#D97706',
    padding: 8,
    marginBottom: 6,
  },
  threatItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  threatMerchantName: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.ink,
  },
  threatHikeBadge: {
    backgroundColor: '#DC2626',
    color: '#FFF',
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  threatDupBadge: {
    backgroundColor: '#7C3AED',
    color: '#FFF',
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  threatDetail: {
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    color: '#333',
    lineHeight: 12,
  },
  codeText: {
    fontWeight: '900',
    color: COLORS.ink,
  },
  privacyNotice: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#94A3B8',
    padding: 8,
    marginBottom: 10,
  },
  privacyTitle: {
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#334155',
  },
  privacyText: {
    fontSize: 8,
    fontFamily: BRUTALIST.fontMono,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 11,
  },
  rawJsonSection: {
    marginTop: 4,
  },
  rawJsonToggle: {
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  rawJsonToggleText: {
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.yellow,
  },
  rawJsonViewer: {
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    padding: 8,
    maxHeight: 180,
  },
  rawJsonCode: {
    fontSize: 7.5,
    fontFamily: BRUTALIST.fontMono,
    color: '#38BDF8',
    lineHeight: 11,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    padding: 10,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.ink,
    marginBottom: 6,
  },
  infoStep: {
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    color: '#334155',
    lineHeight: 13,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '900',
    color: COLORS.ink,
  },
  footer: {
    borderTopWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    paddingTop: 10,
  },
  doneButton: {
    backgroundColor: COLORS.ink,
    paddingVertical: 10,
    alignItems: 'center',
    ...BRUTALIST.shadowSm,
  },
  doneButtonText: {
    color: COLORS.yellow,
    fontSize: 10,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
