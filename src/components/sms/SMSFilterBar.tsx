import React from 'react';
import {
  View,
  TextInput,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { FilterCategory } from '../../types/sms';
import { Ionicons } from '@expo/vector-icons';

interface SMSFilterBarProps {
  selectedFilter: FilterCategory;
  onSelectFilter: (filter: FilterCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: Record<FilterCategory, number>;
}

const FILTER_OPTIONS: { id: FilterCategory; label: string }[] = [
  { id: 'ALL', label: 'ALL SMS' },
  { id: 'DEBIT', label: 'DEBITS' },
  { id: 'CREDIT', label: 'CREDITS' },
  { id: 'BILL_DUE', label: 'BILLS' },
  { id: 'OTP_AUTH', label: 'OTPS' },
  { id: 'INVESTMENT', label: 'INVEST' },
  { id: 'PROMOTIONAL', label: 'SPAM' },
];

export const SMSFilterBar: React.FC<SMSFilterBarProps> = ({
  selectedFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  counts,
}) => {
  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={COLORS.ink} style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="SEARCH MERCHANT, BANK, OR AMOUNT..."
          placeholderTextColor={COLORS.mutedText}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => onSearchChange('')} style={styles.clearBtn}>
            <Ionicons name="close" size={16} color={COLORS.ink} />
          </Pressable>
        )}
      </View>

      {/* Filter Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {FILTER_OPTIONS.map((opt) => {
          const isActive = selectedFilter === opt.id;
          const count = counts[opt.id] || 0;

          return (
            <Pressable
              key={opt.id}
              onPress={() => onSelectFilter(opt.id)}
              style={[
                styles.filterPill,
                isActive ? styles.filterPillActive : styles.filterPillInactive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive ? styles.filterTextActive : styles.filterTextInactive,
                ]}
              >
                {opt.label}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  isActive ? styles.countBadgeActive : styles.countBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    isActive ? styles.countTextActive : styles.countTextInactive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    paddingHorizontal: 10,
    height: 42,
    marginBottom: 10,
    ...BRUTALIST.shadowSm,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: BRUTALIST.fontMono,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.ink,
  },
  clearBtn: {
    padding: 4,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: BRUTALIST.borderWidthThin,
    borderColor: COLORS.ink,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: COLORS.ink,
    ...BRUTALIST.shadowSm,
  },
  filterPillInactive: {
    backgroundColor: COLORS.white,
  },
  filterText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  filterTextInactive: {
    color: COLORS.ink,
  },
  countBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: COLORS.ink,
  },
  countBadgeActive: {
    backgroundColor: COLORS.yellow,
  },
  countBadgeInactive: {
    backgroundColor: COLORS.paperDark,
  },
  countBadgeText: {
    fontFamily: BRUTALIST.fontMono,
    fontSize: 9,
    fontWeight: '900',
  },
  countTextActive: {
    color: COLORS.ink,
  },
  countTextInactive: {
    color: COLORS.ink,
  },
});
