import React, {useMemo} from 'react';
import {Text, useColorScheme, View} from 'react-native';
import {getColors} from '../../theme';
import {formatCountdown} from '../../utils/otp';
import {createOtpExpiryRingStyles} from './OtpExpiryRing.styles';

export interface OtpExpiryRingProps {
  remainingMs: number;
  totalMs: number;
  label?: string;
}

export function OtpExpiryRing({
  remainingMs,
  totalMs,
  label = 'OTP expires in',
}: OtpExpiryRingProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(() => createOtpExpiryRingStyles(colors), [colors]);
  const ratio = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  const urgent = ratio <= 0.15 && remainingMs > 0;
  const ringColor = urgent ? colors.error : colors.success;

  return (
    <View
      style={styles.wrap}
      accessibilityRole="timer"
      accessibilityLabel={`${label} ${formatCountdown(remainingMs)}`}>
      <View style={[styles.ringTrack, {borderColor: colors.border}]}>
        <View
          style={[
            styles.ringProgress,
            {
              borderColor: ringColor,
              opacity: ratio,
              transform: [{scale: 0.85 + ratio * 0.15}],
            },
          ]}
        />
        <Text style={[styles.time, urgent && styles.timeUrgent]}>
          {formatCountdown(remainingMs)}
        </Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
