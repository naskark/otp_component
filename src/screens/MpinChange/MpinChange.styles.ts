import {StyleSheet} from 'react-native';
import type {ThemeColors} from '../../theme';
import {radii, spacing, typography} from '../../theme';

export function createMpinChangeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      minHeight: 44,
    },
    backButton: {
      paddingVertical: spacing.sm,
      paddingRight: spacing.md,
      minWidth: 64,
    },
    backLabel: {
      ...typography.body,
      color: colors.text,
      fontWeight: '600',
    },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xxl,
    },
    content: {
      width: '100%',
      maxWidth: 360,
      alignSelf: 'center',
    },
    title: {
      ...typography.title,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xxl,
    },
    fieldLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    field: {
      marginBottom: spacing.xl,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      ...typography.body,
      color: colors.text,
      letterSpacing: 8,
      textAlign: 'center',
      minHeight: 52,
    },
    inputError: {
      borderColor: colors.borderError,
    },
    error: {
      ...typography.caption,
      color: colors.error,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    successBox: {
      alignItems: 'center',
      gap: spacing.md,
    },
    successTitle: {
      ...typography.title,
      color: colors.success,
      textAlign: 'center',
      fontSize: 22,
    },
    successBody: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    contextHint: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    securityNotice: {
      marginTop: spacing.xl,
      padding: spacing.md,
      backgroundColor: colors.securityBg,
      borderRadius: radii.md,
    },
    securityText: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
