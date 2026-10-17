import { StyleSheet, Platform, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from './colors';

export const BRUTALIST = {
  borderWidth: 2.5,
  borderWidthThin: 2,
  borderWidthThick: 3.5,
  radius: 0, // True sharp brutalism
  radiusSm: 4, // Slight softened brutalist edge for ergonomics

  fontMono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'Courier New, monospace',
  }),

  // Hard drop shadows (Zero blur, stark solid offset)
  shadowDefault: Platform.select<ViewStyle>({
    web: {
      boxShadow: '4px 4px 0px #0A0A0A',
    } as any,
    default: {
      shadowColor: '#0A0A0A',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 5,
    },
  }) as ViewStyle,

  shadowSm: Platform.select<ViewStyle>({
    web: {
      boxShadow: '2px 2px 0px #0A0A0A',
    } as any,
    default: {
      shadowColor: '#0A0A0A',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
  }) as ViewStyle,

  shadowLg: Platform.select<ViewStyle>({
    web: {
      boxShadow: '6px 6px 0px #0A0A0A',
    } as any,
    default: {
      shadowColor: '#0A0A0A',
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 7,
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
