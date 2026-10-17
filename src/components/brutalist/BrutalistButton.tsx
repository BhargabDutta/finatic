import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { BRUTALIST } from '../../theme/styles';

type ButtonVariant = 'ink' | 'lime' | 'coral' | 'yellow' | 'outline' | 'purple' | 'cyan';

interface BrutalistButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: 'sm' | 'md' | 'lg';
}

export const BrutalistButton: React.FC<BrutalistButtonProps> = ({
  title,
  onPress,
  variant = 'ink',
  icon,
  disabled = false,
  style,
  textStyle,
  size = 'md',
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getVariantBg = () => {
    switch (variant) {
      case 'lime':
        return COLORS.lime;
      case 'coral':
        return COLORS.coral;
      case 'yellow':
        return COLORS.yellow;
      case 'purple':
        return COLORS.purple;
      case 'cyan':
        return COLORS.cyan;
      case 'outline':
        return COLORS.white;
      case 'ink':
      default:
        return COLORS.ink;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'ink':
      case 'purple':
        return COLORS.white;
      case 'outline':
      case 'lime':
      case 'coral':
      case 'yellow':
      case 'cyan':
      default:
        return COLORS.ink;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 6, paddingHorizontal: 10, fontSize: 12 };
      case 'lg':
        return { paddingVertical: 14, paddingHorizontal: 20, fontSize: 16 };
      case 'md':
      default:
        return { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 };
    }
  };

  const sz = getSizeStyle();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.base,
        {
          backgroundColor: disabled ? COLORS.lightGray : getVariantBg(),
          paddingVertical: sz.paddingVertical,
          paddingHorizontal: sz.paddingHorizontal,
          transform: isPressed ? [{ translateX: 2 }, { translateY: 2 }] : [],
        },
        !isPressed && (size === 'sm' ? BRUTALIST.shadowSm : BRUTALIST.shadowDefault),
        disabled && { opacity: 0.6 },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {icon && (
          <Ionicons
            name={icon}
            size={sz.fontSize + 3}
            color={disabled ? COLORS.mutedText : getTextColor()}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.text,
            {
              color: disabled ? COLORS.mutedText : getTextColor(),
              fontSize: sz.fontSize,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
