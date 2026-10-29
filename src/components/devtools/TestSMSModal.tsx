import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { BrutalistCard } from '../brutalist/BrutalistCard';
import { BrutalistButton } from '../brutalist/BrutalistButton';
import { parseSMS } from '../../services/smsParser';
import { generateRandomIncomingSMS } from '../../services/mockData';
import { SMSMessage } from '../../types/sms';
import { Ionicons } from '@expo/vector-icons';

interface TestSMSModalProps {
  visible: boolean;
  onClose: () => void;
  onAddMessage: (msg: SMSMessage) => void;
  onResetData: () => void;
}

const PRESET_TEMPLATES = [
  {
    label: 'Netflix UPI AutoPay',
    sender: 'VK-HDFCBK',
    body: 'HDFC Bank: Rs. 649.00 debited from A/c **1234 towards UPI AutoPay mandate for NETFLIX. UMRN: UMRN99482187.',
  },
  {
    label: 'Canva Pro Card SI',
    sender: 'AX-AXISBK',
    body: 'Axis Bank: Standing Instruction executed for Rs. 899.00 on Card **5678 for CANVA PRO. Next auto-debit Nov-2026.',
  },
  {
    label: 'Cult.fit NACH e-Mandate',
    sender: 'AX-ICICIB',
    body: 'ICICI Bank: Auto-debit of Rs 1,750.00 processed via NACH mandate UMRN11928374 for CULT FIT HEALTHCARE.',
  },
  {
    label: 'Hotstar Pre-Debit Alert',
    sender: 'VK-HDFCBK',
    body: 'Pre-debit Notification: Rs. 299.00 will be auto-debited on 18-Oct for recurring mandate SI-HDFC-HOTSTAR on Card **1234.',
  },
  {
    label: 'Apple iCloud Recurring',
    sender: 'AX-ICICIB',
    body: 'Pre-debit Notification: Rs. 89.00 will be auto-debited on 20-Oct-26 for recurring mandate for APPLE ICLOUD on Card **9012.',
  },
];

export const TestSMSModal: React.FC<TestSMSModalProps> = ({
  visible,
  onClose,
  onAddMessage,
  onResetData,
}) => {
  const [customSender, setCustomSender] = useState('VK-HDFCBK');
  const [customBody, setCustomBody] = useState('');

  const handleInjectRandom = () => {
    const msg = generateRandomIncomingSMS();
    onAddMessage(msg);
    onClose();
  };

  const handleAddCustom = () => {
    if (!customBody.trim()) return;

    const newMsg: SMSMessage = {
      id: `custom-${Date.now()}`,
      address: customSender.trim() || 'CUSTOM_SMS',
      body: customBody.trim(),
      date: Date.now(),
      read: true,
      parsed: parseSMS(customBody.trim(), customSender.trim()),
      isSimulated: true,
    };

    onAddMessage(newMsg);
    setCustomBody('');
    onClose();
  };

  const handleApplyPreset = (sender: string, body: string) => {
    setCustomSender(sender);
    setCustomBody(body);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <BrutalistCard bgColor={COLORS.white} style={styles.card} noPadding>
            {/* Title Bar */}
            <View style={styles.titleBar}>
              <View style={styles.titleLeft}>
                <Ionicons name="hardware-chip" size={16} color={COLORS.yellow} />
                <Text style={styles.titleText}>SMS ENGINE TEST LAB</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color={COLORS.white} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollBody}>
              {/* Quick Simulator Trigger */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. QUICK SIMULATE LIVE INCOMING SMS</Text>
                <Text style={styles.sectionDesc}>
                  Generates an authentic incoming bank transaction SMS right now, updating metrics & feed instantly.
                </Text>
                <BrutalistButton
                  title="INJECT RANDOM LIVE SMS"
                  onPress={handleInjectRandom}
                  variant="lime"
                  icon="flash"
                />
              </View>

              {/* Presets */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. QUICK PRESET SAMPLES</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                  {PRESET_TEMPLATES.map((p, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => handleApplyPreset(p.sender, p.body)}
                      style={styles.presetChip}
                    >
                      <Text style={styles.presetChipText}>{p.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Custom SMS Input */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. PASTE / WRITE CUSTOM SMS</Text>
                <Text style={styles.sectionDesc}>
                  Paste any SMS from your phone to test entity extraction (Amount, Bank, Merchant, OTP, Bal).
                </Text>

                <Text style={styles.inputLabel}>SENDER ADDRESS / HEADER</Text>
                <TextInput
                  value={customSender}
                  onChangeText={setCustomSender}
                  placeholder="e.g. VK-HDFCBK or CHASE"
                  placeholderTextColor={COLORS.mutedText}
                  style={styles.textInput}
                />

                <Text style={styles.inputLabel}>SMS BODY</Text>
                <TextInput
                  value={customBody}
                  onChangeText={setCustomBody}
                  placeholder="Paste SMS text here (e.g. Rs 450 debited from A/c...)"
                  placeholderTextColor={COLORS.mutedText}
                  multiline
                  numberOfLines={4}
                  style={[styles.textInput, styles.multilineInput]}
                />

                <BrutalistButton
                  title="PARSE & ADD TO FEED"
                  onPress={handleAddCustom}
                  variant="yellow"
                  icon="checkmark-done"
                  disabled={!customBody.trim()}
                  style={styles.submitBtn}
                />
              </View>

              {/* Danger Zone: Reset Data */}
              <View style={styles.resetSection}>
                <Text style={styles.resetLabel}>RESET INBOX STATE</Text>
                <BrutalistButton
                  title="RESET TO DEFAULT DATASET"
                  onPress={() => {
                    onResetData();
                    onClose();
                  }}
                  variant="coral"
                  size="sm"
                  icon="trash-bin-outline"
                />
              </View>
            </ScrollView>
          </BrutalistCard>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    maxHeight: '90%',
  },
  card: {
    borderRadius: 0,
  },
  titleBar: {
    backgroundColor: COLORS.ink,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    color: COLORS.white,
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 2,
  },
  scrollBody: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderColor: COLORS.faintBorder,
  },
  sectionTitle: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    marginBottom: 4,
  },
  sectionDesc: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    color: COLORS.mutedText,
    marginBottom: 10,
    lineHeight: 14,
  },
  presetScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  presetChip: {
    backgroundColor: COLORS.paperDark,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  presetChipText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.ink,
  },
  inputLabel: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
    marginBottom: 4,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderWidth: BRUTALIST.borderWidthThin,
    borderColor: COLORS.ink,
    fontFamily: BRUTALIST.fontMono,
    fontSize: 12,
    padding: 8,
    color: COLORS.ink,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 10,
  },
  resetSection: {
    paddingTop: 8,
  },
  resetLabel: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.coral,
    marginBottom: 6,
  },
});
