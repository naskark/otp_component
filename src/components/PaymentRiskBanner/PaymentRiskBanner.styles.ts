import {StyleSheet} from 'react-native';
import type {ThemeColors} from '../../theme';
import {radii, spacing, typography} from '../../theme';

export function createPaymentRiskBannerStyles(colors: ThemeColors) {
  return StyleSheet.create({
    banner: {
      backgroundColor: colors.securityBg,
      borderWidth: 1,
      borderColor: colors.warning,
      borderRadius: radii.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.bodyBold,
      color: colors.warning,
      marginBottom: spacing.xs,
    },
    body: {
      ...typography.caption,
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });
}
