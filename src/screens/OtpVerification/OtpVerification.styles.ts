import {StyleSheet} from 'react-native';
import type {ThemeColors} from '../../theme';
import {radii, spacing, typography} from '../../theme';

export function createOtpVerificationStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
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
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    content: {
      width: '100%',
      maxWidth: 360,
      alignSelf: 'center',
    },
    inlineBlock: {
      width: '100%',
      maxWidth: 360,
      alignSelf: 'center',
      marginTop: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    title: {
      ...typography.title,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    instruction: {
      ...typography.body,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.xl,
      width: '100%',
    },
    instructionBold: {
      ...typography.bodyBold,
      color: colors.text,
    },
    wrongNumberLink: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      textDecorationLine: 'underline',
      marginTop: -spacing.md,
      marginBottom: spacing.lg,
    },
    contextSlot: {
      marginBottom: spacing.xl,
    },
    otpSection: {
      marginBottom: spacing.xl,
      alignItems: 'center',
    },
    timers: {
      marginTop: spacing.md,
      gap: spacing.sm,
      alignItems: 'center',
      width: '100%',
    },
    feedbackStack: {
      width: '100%',
      marginTop: spacing.md,
      gap: spacing.xs,
      alignItems: 'center',
    },
    feedback: {
      ...typography.caption,
      textAlign: 'center',
      width: '100%',
    },
    feedbackError: {
      color: colors.error,
    },
    feedbackSuccess: {
      color: colors.success,
    },
    feedbackInfo: {
      color: colors.textSecondary,
    },
    autoReadHint: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    buttonWrap: {
      marginBottom: spacing.xl,
    },
    resendPressable: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    resendLoaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    resendRow: {
      ...typography.body,
      color: colors.text,
      textAlign: 'center',
    },
    resendAction: {
      ...typography.bodyBold,
      color: colors.text,
    },
    resendDisabled: {
      color: colors.textMuted,
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
