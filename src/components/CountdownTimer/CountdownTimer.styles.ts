import {StyleSheet} from 'react-native';
import type {ThemeColors} from '../../theme';
import {typography} from '../../theme';

export function createCountdownStyles(colors: ThemeColors) {
  return StyleSheet.create({
    text: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      width: '100%',
    },
    expired: {
      color: colors.error,
    },
  });
}
