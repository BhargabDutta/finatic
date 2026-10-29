import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';
import { TransactionType, ExpenseCategory } from '../../types/sms';

interface BrutalistBadgeProps {
  label: string;
  type?: TransactionType;
  category?: ExpenseCategory;
  customBg?: string;
  customText?: string;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export const BrutalistBadge: React.FC<BrutalistBadgeProps> = ({
  label,
  type,
  customBg,
  customText,
  size = 'sm',
  style,
}) => {
  const getBadgeColors = (): { bg: string; text: string } => {
    if (customBg) {
      return { bg: customBg, text: customText || COLORS.ink };
    }

    switch (type) {
      case 'UPI_AUTOPAY':
        return { bg: COLORS.cyan, text: COLORS.ink };
      case 'CARD_SI':
        return { bg: COLORS.coral, text: COLORS.white };
      case 'NACH_ECS':
        return { bg: COLORS.yellow, text: COLORS.ink };
      case 'PRE_DEBIT_ALERT':
        return { bg: COLORS.orange, text: COLORS.white };
      case 'RECURRING_SUB':
        return { bg: COLORS.purple, text: COLORS.white };
      default:
        return { bg: COLORS.paperDark, text: COLORS.ink };
    }
  };

  const { bg, text } = getBadgeColors();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 6 : 10,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: text,
            fontSize: isSmall ? 10 : 12,
          },
        ]}
        numberOfLines={1}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderWidth: BRUTALIST.borderWidthThin,
    borderColor: COLORS.ink,
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: BRUTALIST.fontMono,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
