import {StyleSheet} from 'react-native';
import type {ThemeColors} from '../../theme';
import {spacing, typography} from '../../theme';

export function createOtpExpiryRingStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      marginTop: spacing.md,
    },
    ringTrack: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 3,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    ringProgress: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 44,
      borderWidth: 3,
    },
    time: {
      ...typography.bodyBold,
      fontSize: 16,
      color: colors.text,
    },
    timeUrgent: {
      color: colors.error,
    },
    label: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
