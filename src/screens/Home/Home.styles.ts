import {StyleSheet} from 'react-native';
import type {ThemeColors} from '../../theme';
import {radii, spacing, typography} from '../../theme';

export function createHomeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xxl,
    },
    content: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
    },
    title: {
      ...typography.title,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    securityCallout: {
      backgroundColor: colors.securityBg,
      borderRadius: radii.md,
      padding: spacing.md,
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    securityCalloutTitle: {
      ...typography.bodyBold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    securityCalloutBody: {
      ...typography.caption,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    verifiedBadge: {
      ...typography.caption,
      color: colors.success,
      marginTop: spacing.xs,
      fontWeight: '600',
    },
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      backgroundColor: colors.background,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 76,
    },
    cardPressed: {
      backgroundColor: colors.surface,
    },
    icon: {
      fontSize: 28,
      width: 40,
      textAlign: 'center',
    },
    cardText: {
      flex: 1,
    },
    cardTitle: {
      ...typography.bodyBold,
      color: colors.text,
      marginBottom: 2,
    },
    cardSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    chevron: {
      ...typography.body,
      color: colors.textMuted,
      fontSize: 22,
    },
    hint: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
  });
}
