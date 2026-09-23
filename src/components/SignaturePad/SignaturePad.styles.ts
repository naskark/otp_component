import {StyleSheet} from 'react-native';
import type {ThemeColors} from '../../theme';
import {radii, spacing, typography} from '../../theme';

export function createSignaturePadStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrapper: {
      width: '100%',
    },
    label: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    pad: {
      height: 200,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    padActive: {
      borderColor: colors.text,
    },
    padLocked: {
      opacity: 0.92,
    },
    hint: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    segment: {
      position: 'absolute',
      height: 2.5,
      borderRadius: 2,
    },
  });
}
