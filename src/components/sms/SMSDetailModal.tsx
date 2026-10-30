import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { BrutalistCard } from '../brutalist/BrutalistCard';
import { BrutalistButton } from '../brutalist/BrutalistButton';
import { BrutalistBadge } from '../brutalist/BrutalistBadge';
import { SMSMessage } from '../../types/sms';
import { Ionicons } from '@expo/vector-icons';

interface SMSDetailModalProps {
  message: SMSMessage | null;
  visible: boolean;
  onClose: () => void;
}

export const SMSDetailModal: React.FC<SMSDetailModalProps> = ({
  message,
  visible,
  onClose,
}) => {
  if (!message) return null;

  const { parsed, address, body, date } = message;

  const fullDateStr = new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <BrutalistCard bgColor={COLORS.white} style={styles.card} noPadding>
            {/* Modal Title Bar */}
            <View style={styles.titleBar}>
              <View style={styles.titleLeft}>
                <Ionicons name="document-text" size={16} color={COLORS.white} />
                <Text style={styles.titleText}>SMS INTEL BREAKDOWN</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color={COLORS.white} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollBody}>
              {/* Type and Timestamp */}
              <View style={styles.metaRow}>
                <BrutalistBadge
                  label={parsed.type.replace('_', ' ')}
                  type={parsed.type}
                  size="md"
                />
                <Text style={styles.dateText}>{fullDateStr}</Text>
              </View>

              {/* Amount Highlight */}
              {parsed.amount !== null && (
                <View style={styles.amountHighlightBox}>
                  <Text style={styles.amountLabel}>PARSED TRANSACTION VALUE</Text>
                  <Text style={styles.amountNumber}>
                    {parsed.currencySymbol}{parsed.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                  <Text style={styles.currencyBadge}>CURRENCY: {parsed.currency}</Text>
                </View>
              )}

              {/* Entities Grid */}
              <View style={styles.entitiesSection}>
                <Text style={styles.sectionHeader}>EXTRACTED ENTITIES</Text>

                <View style={styles.entityTable}>
                  <EntityRow label="MERCHANT / ENTITY" value={parsed.merchant || 'Not Specified'} />
                  <EntityRow label="SENDER / BANK" value={parsed.bankOrSender} />
                  <EntityRow label="RAW SENDER ID" value={address} />
                  <EntityRow label="EXPENSE CATEGORY" value={parsed.category.replace('_', ' ')} />
                  <EntityRow label="ACCOUNT / CARD" value={parsed.accountDigits || 'N/A'} />
                  <EntityRow
                    label="AVAILABLE BALANCE"
                    value={
                      parsed.balanceRemaining !== null
                        ? `${parsed.currencySymbol}${parsed.balanceRemaining.toLocaleString()}`
                        : 'N/A'
                    }
                  />
                  <EntityRow label="TXN / REF NO." value={parsed.referenceNumber || 'N/A'} />
                  {parsed.dueDate && <EntityRow label="PAYMENT DUE DATE" value={parsed.dueDate} />}
                  {parsed.mandateReference && (
                    <EntityRow label="MANDATE / UMRN REF" value={parsed.mandateReference} highlight />
                  )}
                  <EntityRow
                    label="NLP CONFIDENCE"
                    value={`${parsed.confidenceScore}% (${parsed.confidenceScore >= 75 ? 'HIGH' : 'STANDARD'})`}
                  />
                </View>
              </View>

              {/* Privacy Shield Notice */}
              <View style={styles.privacyCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Ionicons name="shield-checkmark-outline" size={13} color={COLORS.ink} style={{ marginRight: 6 }} />
                  <Text style={styles.privacyTitle}>ZERO-KNOWLEDGE PRIVACY ACTIVE</Text>
                </View>
                <Text style={styles.privacyDesc}>
                  Finatic never scans or stores OTPs, personal P2P transfers, or retail swipes. Only verified auto-payments and recurring mandates are captured.
                </Text>
              </View>

              {/* Raw SMS Body */}
              <View style={styles.rawSection}>
                <Text style={styles.sectionHeader}>ORIGINAL RAW SMS TEXT</Text>
                <View style={styles.rawBox}>
                  <Text style={styles.rawText}>{body}</Text>
                </View>
              </View>

              <BrutalistButton
                title="CLOSE BREAKDOWN"
                onPress={onClose}
                variant="ink"
                style={styles.closeActionBtn}
              />
            </ScrollView>
          </BrutalistCard>
        </View>
      </View>
    </Modal>
  );
};

const EntityRow = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.entityRow}>
    <Text style={styles.entityLabel}>{label}</Text>
    <Text style={[styles.entityValue, highlight && styles.highlightValue]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dateText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.mutedText,
  },
  amountHighlightBox: {
    backgroundColor: COLORS.paper,
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  amountLabel: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.mutedText,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  amountNumber: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.ink,
  },
  currencyBadge: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.ink,
    marginTop: 4,
  },
  entitiesSection: {
    marginBottom: 14,
  },
  sectionHeader: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.ink,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  entityTable: {
    borderWidth: BRUTALIST.borderWidthThin,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
  },
  entityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: COLORS.faintBorder,
  },
  entityLabel: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.mutedText,
  },
  entityValue: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.ink,
    textAlign: 'right',
    maxWidth: '55%',
  },
  highlightValue: {
    color: COLORS.coral,
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 4,
  },
  privacyCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: COLORS.lime,
    padding: 10,
    marginBottom: 14,
  },
  privacyTitle: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 10,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  privacyDesc: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9.5,
    color: '#166534',
    lineHeight: 14,
  },
  rawSection: {
    marginBottom: 16,
  },
  rawBox: {
    backgroundColor: COLORS.paperDark,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    padding: 10,
  },
  rawText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 11,
    color: COLORS.ink,
    lineHeight: 16,
  },
  closeActionBtn: {
    marginTop: 4,
  },
});
