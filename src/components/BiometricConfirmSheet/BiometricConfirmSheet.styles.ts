import {StyleSheet} from 'react-native';
import type {ThemeColors} from '../../theme';
import {radii, spacing, typography} from '../../theme';

export function createBiometricConfirmSheetStyles(colors: ThemeColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radii.lg,
      borderTopRightRadius: radii.lg,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      alignItems: 'center',
    },
    icon: {
      fontSize: 40,
      marginBottom: spacing.md,
    },
    title: {
      ...typography.bodyBold,
      fontSize: 18,
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    body: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    button: {
      alignSelf: 'stretch',
      backgroundColor: colors.button,
      borderRadius: radii.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    buttonLabel: {
      ...typography.button,
      color: colors.buttonText,
    },
    secondaryButton: {
      alignSelf: 'stretch',
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    secondaryLabel: {
      ...typography.body,
      color: colors.textSecondary,
      fontWeight: '600',
    },
  });
}
