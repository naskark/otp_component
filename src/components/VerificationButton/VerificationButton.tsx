import React, {useMemo} from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  useColorScheme,
} from 'react-native';
import {getColors} from '../../theme';
import {createVerificationButtonStyles} from './VerificationButton.styles';
import type {VerificationButtonProps} from './VerificationButton.types';

export function VerificationButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  accessibilityLabel,
}: VerificationButtonProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(
    () => createVerificationButtonStyles(colors),
    [colors],
  );
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({pressed}) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && {opacity: 0.85},
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{disabled: isDisabled, busy: loading}}
      testID="verification-button">
      {loading ? (
        <ActivityIndicator color={colors.buttonText} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

export default VerificationButton;
