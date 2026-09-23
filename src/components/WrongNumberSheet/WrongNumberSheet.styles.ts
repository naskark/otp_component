import {StyleSheet} from 'react-native';
import type {ThemeColors} from '../../theme';
import {radii, spacing, typography} from '../../theme';

export function createWrongNumberSheetStyles(colors: ThemeColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radii.lg,
      borderTopRightRadius: radii.lg,
      padding: spacing.xl,
    },
    title: {
      ...typography.bodyBold,
      fontSize: 18,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    body: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.xl,
    },
    button: {
      backgroundColor: colors.button,
      borderRadius: radii.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    buttonLabel: {
      ...typography.button,
      color: colors.buttonText,
    },
  });
}
