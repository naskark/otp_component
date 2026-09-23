import {StyleSheet} from 'react-native';
import type {ThemeColors} from '../../theme';
import {radii, spacing, typography} from '../../theme';

export function createVerificationButtonStyles(colors: ThemeColors) {
  return StyleSheet.create({
    button: {
      backgroundColor: colors.button,
      borderRadius: radii.md,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
      width: '100%',
    },
    buttonDisabled: {
      backgroundColor: colors.buttonDisabled,
    },
    label: {
      ...typography.button,
      color: colors.buttonText,
    },
  });
}
