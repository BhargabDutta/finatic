import { StyleSheet, Platform, ViewStyle } from 'react-native';
import { COLORS } from './colors';

export const BRUTALIST = {
  borderWidth: 2,
  borderWidthThin: 1.5,
  borderWidthThick: 3,
  radius: 0, // True sharp architectural brutalism
  radiusSm: 2,

  // User-friendly System Sans-Serif Fonts (Clean, legible, readable)
  fontSans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  fontSansMedium: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  fontSansBold: Platform.select({
    ios: 'System',
    android: 'sans-serif-bold',
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),

  // Monospace (Reserved strictly for financial figures, codes, and Cypher tokens)
  fontMono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  }),

  // Crisp Solid Drop Shadows (Tactile, non-blurry, elegant offset)
  shadowDefault: Platform.select<ViewStyle>({
    web: {
      boxShadow: '3px 3px 0px #111827',
    } as any,
    default: {
      shadowColor: '#111827',
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
  }) as ViewStyle,

  shadowSm: Platform.select<ViewStyle>({
    web: {
      boxShadow: '2px 2px 0px #111827',
    } as any,
    default: {
      shadowColor: '#111827',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
  }) as ViewStyle,

  shadowLg: Platform.select<ViewStyle>({
    web: {
      boxShadow: '4px 4px 0px #111827',
    } as any,
    default: {
      shadowColor: '#111827',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 6,
    },
  }) as ViewStyle,
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  boldBorder: {
    borderWidth: BRUTALIST.borderWidth,
    borderColor: COLORS.ink,
  },
  screenPadding: {
    paddingHorizontal: 16,
  },
  monoText: {
    fontFamily: BRUTALIST.fontMono,
    color: COLORS.ink,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: COLORS.ink,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: COLORS.ink,
  },
});
