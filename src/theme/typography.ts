import {Platform, TextStyle} from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  title: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  } satisfies TextStyle,
  body: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  } satisfies TextStyle,
  bodyBold: {
    fontFamily,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  } satisfies TextStyle,
  caption: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  } satisfies TextStyle,
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  } satisfies TextStyle,
  otpDigit: {
    fontFamily,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  } satisfies TextStyle,
  amount: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  } satisfies TextStyle,
} as const;
