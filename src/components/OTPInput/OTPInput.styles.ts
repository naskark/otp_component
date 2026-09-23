import {StyleSheet} from 'react-native';
import type {ThemeColors} from '../../theme';
import {radii, spacing, typography} from '../../theme';

function cellLayoutForLength(length: number): {
  cellSize: number;
  gap: number;
  maxWidth: number;
} {
  if (length <= 4) {
    return {cellSize: 56, gap: spacing.md, maxWidth: 320};
  }
  if (length === 5) {
    return {cellSize: 48, gap: spacing.sm, maxWidth: 340};
  }
  return {cellSize: 44, gap: spacing.sm, maxWidth: 360};
}

export function createOTPInputStyles(
  colors: ThemeColors,
  length = 4,
) {
  const {cellSize, gap, maxWidth} = cellLayoutForLength(length);
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap,
      position: 'relative',
      minHeight: cellSize,
      maxWidth,
      width: '100%',
      overflow: 'hidden',
      alignSelf: 'center',
    },
    cell: {
      width: cellSize,
      height: cellSize,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    cellFocused: {
      borderColor: colors.borderFocused,
      borderWidth: 1.5,
    },
    cellFilled: {
      borderColor: colors.borderFocused,
    },
    cellHighlight: {
      borderColor: colors.success,
      backgroundColor: colors.securityBg,
    },
    cellError: {
      borderColor: colors.borderError,
    },
    cellDisabled: {
      opacity: 0.5,
    },
    digit: {
      ...typography.otpDigit,
      color: colors.text,
      textAlign: 'center',
    },
    autofillInput: {
      ...StyleSheet.absoluteFillObject,
      color: 'transparent',
      opacity: 0.02,
      fontSize: 1,
      letterSpacing: 0,
      zIndex: 2,
    },
  });
}
