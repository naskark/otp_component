import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Platform,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import {useOtpAutoRead} from '../../hooks/useOtpAutoRead';
import {getColors} from '../../theme';
import {hapticDigitTap} from '../../utils/haptics';
import {sanitizeOtpInput} from '../../utils/otp';
import {createOTPInputStyles} from './OTPInput.styles';
import type {OTPInputProps} from './OTPInput.types';

export function OTPInput({
  length = 4,
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
  autoRead = true,
  fillHighlight = false,
  attemptPulse = false,
  onComplete,
  onAutoRead,
  accessibilityLabel = 'One-time password',
  style,
}: OTPInputProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(
    () => createOTPInputStyles(colors, length),
    [colors, length],
  );
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const prevLengthRef = useRef(value.length);
  const digits = value.padEnd(length, ' ').slice(0, length).split('');
  const activeIndex = Math.min(value.length, length - 1);

  const {inputFocusReady} = useOtpAutoRead({
    length,
    enabled: autoRead && !disabled && value.length < length,
    currentValue: value,
    onOtp: (otp, source) => {
      onChange(otp);
      onAutoRead?.(otp, source);
    },
  });

  useEffect(() => {
    if (autoFocus && !disabled && inputFocusReady) {
      const id = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(id);
    }
  }, [autoFocus, disabled, inputFocusReady]);

  useEffect(() => {
    if (value.length === length) {
      onComplete?.(value);
    }
  }, [length, onComplete, value]);

  useEffect(() => {
    if (!fillHighlight) {
      return;
    }
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.04,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fillHighlight, scaleAnim]);

  useEffect(() => {
    if (!attemptPulse) {
      pulseAnim.setValue(0);
      return;
    }
    pulseAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: false,
        }),
      ]),
      {iterations: 2},
    ).start();
  }, [attemptPulse, pulseAnim]);

  const pulseBorder = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borderError, colors.error],
  });

  const handleChange = (text: string) => {
    if (disabled) {
      return;
    }
    const next = sanitizeOtpInput(text, length);
    if (next.length > prevLengthRef.current) {
      hapticDigitTap();
    }
    prevLengthRef.current = next.length;
    onChange(next);
  };

  useEffect(() => {
    prevLengthRef.current = value.length;
  }, [value]);

  return (
    <View style={style}>
      <Animated.View style={{transform: [{scale: scaleAnim}]}}>
        <Pressable
          style={styles.container}
          onPress={() => !disabled && inputRef.current?.focus()}
          accessibilityRole="none"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={`Enter the ${length}-digit verification code.`}
          accessibilityState={{disabled}}>
          {digits.map((digit, index) => {
            const isFilled = digit.trim().length > 0;
            const isActive = focused && index === activeIndex && !disabled;
            const CellWrapper = attemptPulse ? Animated.View : View;
            const pulseStyle =
              attemptPulse && error
                ? {borderColor: pulseBorder}
                : undefined;
            return (
              <CellWrapper
                key={`otp-cell-${index}`}
                style={[
                  styles.cell,
                  isFilled && styles.cellFilled,
                  isActive && styles.cellFocused,
                  error && styles.cellError,
                  fillHighlight && isFilled && styles.cellHighlight,
                  disabled && styles.cellDisabled,
                  pulseStyle,
                ]}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants">
                <Text style={styles.digit}>{isFilled ? digit : ''}</Text>
              </CellWrapper>
            );
          })}

          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
            importantForAutofill="yes"
            autoCorrect={false}
            spellCheck={false}
            maxLength={length}
            editable={!disabled}
            caretHidden
            contextMenuHidden={false}
            style={styles.autofillInput}
            accessibilityLabel={accessibilityLabel}
            testID="otp-hidden-input"
          />
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default OTPInput;
