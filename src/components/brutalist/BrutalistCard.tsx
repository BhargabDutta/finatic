import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';

interface BrutalistCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bgColor?: string;
  borderColor?: string;
  shadow?: 'none' | 'sm' | 'default' | 'lg';
  noPadding?: boolean;
}

export const BrutalistCard: React.FC<BrutalistCardProps> = ({
  children,
  style,
  bgColor = COLORS.white,
  borderColor = COLORS.ink,
  shadow = 'default',
  noPadding = false,
}) => {
  const getShadowStyle = () => {
    switch (shadow) {
      case 'none':
        return null;
      case 'sm':
        return BRUTALIST.shadowSm;
      case 'lg':
        return BRUTALIST.shadowLg;
      case 'default':
      default:
        return BRUTALIST.shadowDefault;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
        },
        getShadowStyle(),
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: BRUTALIST.borderWidth,
    borderRadius: BRUTALIST.radius,
    overflow: 'hidden',
  },
  padding: {
    padding: 14,
  },
});
