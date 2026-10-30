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
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { Mandate } from '../../types/mandate';

interface CancellationModalProps {
  visible: boolean;
  mandate: Mandate | null;
  onClose: () => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  visible,
  mandate,
  onClose,
}) => {
  const [completedSteps, setCompletedSteps] = useState<{ [key: number]: boolean }>({});
  const [showGhostingNotice, setShowGhostingNotice] = useState<boolean>(false);

  if (!mandate) return null;

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const copyNotice = () => {
    Alert.alert(
      'Notice Copied to Clipboard',
      'The formal Section 25 dispute letter has been copied. You can email it to your bank grievance officer or file it at cms.rbi.org.in.',
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
              <Text style={styles.headerBadge}>KILLSWITCH // CANCELLATION RUNBOOK</Text>
              <Text style={styles.headerTitle}>{mandate.merchantName}</Text>
              <Text style={styles.headerSubtitle}>
                Rail: {mandate.paymentRail.replace('_', ' ')} {'//'} {mandate.account}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* UMRN Info Box */}
            <View style={styles.umrnBox}>
              <Text style={styles.umrnLabel}>MANDATE REFERENCE / UMRN:</Text>
              <Text style={styles.umrnCode}>
                {mandate.umrn || 'UMRN99482187'}
              </Text>
              <Text style={styles.umrnHelp}>
                Quote this exact reference when revoking in your banking app or filing a dispute.
              </Text>
            </View>

            {/* Steps Checklist */}
            <Text style={styles.sectionHeader}>FOLLOW THESE STEPS TO REVOKE:</Text>

            {mandate.cancellationSteps.map((step) => {
              const isDone = completedSteps[step.step];
              return (
                <TouchableOpacity
                  key={step.step}
                  style={[styles.stepCard, isDone && styles.stepCardDone]}
                  onPress={() => toggleStep(step.step)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
                    <Text style={styles.checkboxText}>{isDone ? '✓' : step.step}</Text>
                  </View>
                  <View style={styles.stepTextContainer}>
                    <Text style={[styles.stepTitle, isDone && styles.textStrikethrough]}>
                      {step.title}
                    </Text>
                    <Text style={[styles.stepDesc, isDone && styles.textStrikethrough]}>
                      {step.instruction}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Merchant Ghosting Protocol Accordion */}
            <View style={styles.ghostingSection}>
              <TouchableOpacity
                style={styles.ghostingHeader}
                onPress={() => setShowGhostingNotice(prev => !prev)}
                activeOpacity={0.8}
              >
                <View style={styles.ghostingTitleRow}>
                  <Ionicons
                    name={showGhostingNotice ? 'chevron-down' : 'chevron-forward'}
                    size={14}
                    color="#111827"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.ghostingTitle}>WHAT IF THE MERCHANT DOES NOT RESPOND?</Text>
                </View>
                <Text style={styles.ghostingTag}>LEGAL ESCALATION</Text>
              </TouchableOpacity>

              {showGhostingNotice && (
                <View style={styles.ghostingBody}>
                  <Text style={styles.ghostingIntro}>
                    If the merchant deleted the cancel button or refuses to honor your cancellation, you are protected under <Text style={{fontWeight: '900'}}>Section 25 of the Payment and Settlement Systems Act, 2007</Text>. Use this formal legal revocation notice:
                  </Text>

                  <View style={styles.letterBox}>
                    <Text style={styles.letterSubject}>
                      Subject: {mandate.ghostingNotice.subject}
                    </Text>
                    <Text style={styles.letterText}>
                      {mandate.ghostingNotice.body}
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.copyButton} onPress={copyNotice}>
                    <Ionicons name="copy-outline" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.copyButtonText}>COPY LEGAL NOTICE</Text>
                  </TouchableOpacity>

                  <View style={styles.ombudsmanBox}>
                    <Text style={styles.ombudsmanTitle}>RBI OMBUDSMAN DIRECT ESCALATION:</Text>
                    <Text style={styles.ombudsmanText}>
                      If your bank or merchant fails to resolve unauthorized debits within 30 days, file an official grievance directly at the RBI Complaint Management System:
                    </Text>
                    <Text style={styles.ombudsmanLink}>https://cms.rbi.org.in</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>DONE // CLOSE RUNBOOK</Text>
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderColor: COLORS.black,
    maxHeight: '88%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderColor: COLORS.black,
    paddingBottom: 12,
    marginBottom: 12,
  },
  headerBadge: {
    backgroundColor: COLORS.black,
    color: '#FFFFFF',
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: BRUTALIST.fontSansBold,
    color: COLORS.black,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 10,
    fontFamily: BRUTALIST.fontMono,
    color: '#555',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: BRUTALIST.fontSansBold,
    color: COLORS.black,
  },
  body: {
    flexGrow: 0,
  },
  umrnBox: {
    backgroundColor: '#FFE600',
    borderWidth: 2,
    borderColor: COLORS.black,
    padding: 10,
    marginBottom: 14,
    ...BRUTALIST.shadowSm,
  },
  umrnLabel: {
    fontSize: 8,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.black,
  },
  umrnCode: {
    fontSize: 16,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: 1,
    marginVertical: 2,
  },
  umrnHelp: {
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    color: '#222',
  },
  sectionHeader: {
    fontSize: 10,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: COLORS.black,
    padding: 10,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  stepCardDone: {
    backgroundColor: '#E8F8F0',
    borderColor: '#00A854',
  },
  checkbox: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  checkboxDone: {
    backgroundColor: '#00A854',
    borderColor: '#00A854',
  },
  checkboxText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 11,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: COLORS.black,
  },
  stepDesc: {
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontMono,
    color: '#444',
    marginTop: 2,
    lineHeight: 14,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  ghostingSection: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: '#F9FAFB',
  },
  ghostingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.ink,
  },
  ghostingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ghostingTitle: {
    fontSize: 9.5,
    fontFamily: BRUTALIST.fontSansBold,
    color: '#FFF',
    flex: 1,
  },
  ghostingTag: {
    backgroundColor: '#374151',
    color: '#FFF',
    fontSize: 7.5,
    fontFamily: BRUTALIST.fontSansBold,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  ghostingBody: {
    padding: 12,
  },
  ghostingIntro: {
    fontSize: 10.5,
    fontFamily: BRUTALIST.fontSans,
    color: '#374151',
    lineHeight: 15,
    marginBottom: 8,
  },
  letterBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 10,
    marginBottom: 10,
  },
  letterSubject: {
    fontSize: 10.5,
    fontFamily: BRUTALIST.fontSansBold,
    color: '#111827',
    marginBottom: 6,
  },
  letterText: {
    fontSize: 10,
    fontFamily: BRUTALIST.fontMono,
    color: '#374151',
    lineHeight: 14,
  },
  copyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: BRUTALIST.fontSansBold,
    letterSpacing: 0.3,
  },
  ombudsmanBox: {
    borderTopWidth: 1,
    borderColor: '#E0CCD0',
    paddingTop: 8,
  },
  ombudsmanTitle: {
    fontSize: 8.5,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#900',
  },
  ombudsmanText: {
    fontSize: 8,
    fontFamily: BRUTALIST.fontMono,
    color: '#555',
    marginVertical: 2,
  },
  ombudsmanLink: {
    fontSize: 9,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    color: '#0066CC',
  },
  footer: {
    borderTopWidth: 2,
    borderColor: COLORS.black,
    paddingTop: 10,
  },
  doneButton: {
    backgroundColor: COLORS.black,
    paddingVertical: 12,
    alignItems: 'center',
    ...BRUTALIST.shadowSm,
  },
  doneButtonText: {
    color: COLORS.yellow,
    fontSize: 11,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
