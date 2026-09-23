import {StyleSheet} from 'react-native';
import type {ThemeColors} from '../../theme';
import {spacing, typography} from '../../theme';

export function createESignatureStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    signingBody: {
      flex: 1,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
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
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    content: {
      width: '100%',
      maxWidth: 360,
      alignSelf: 'center',
      paddingTop: spacing.md,
    },
    title: {
      ...typography.title,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    actionSecondary: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    actionSecondaryLabel: {
      ...typography.bodyBold,
      color: colors.text,
    },
    actionPrimaryWrap: {
      flex: 1,
    },
    error: {
      ...typography.caption,
      color: colors.error,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    signedHint: {
      ...typography.caption,
      color: colors.success,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
  });
}
