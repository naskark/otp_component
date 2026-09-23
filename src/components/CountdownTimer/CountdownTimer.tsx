import React, {useMemo} from 'react';
import {Text, useColorScheme} from 'react-native';
import {getColors} from '../../theme';
import {formatCountdown} from '../../utils/otp';
import {createCountdownStyles} from './CountdownTimer.styles';
import type {CountdownTimerProps} from './CountdownTimer.types';

export function CountdownTimer({
  remainingMs,
  label,
  accessibilityLabel,
}: CountdownTimerProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(() => createCountdownStyles(colors), [colors]);
  const expired = remainingMs <= 0;
  const time = formatCountdown(remainingMs);

  return (
    <Text
      style={[styles.text, expired && styles.expired]}
      accessibilityRole="timer"
      accessibilityLiveRegion="polite"
      accessibilityLabel={
        accessibilityLabel ??
        (expired ? `${label} expired` : `${label} ${time}`)
      }>
      {expired ? `${label} expired` : `${label} ${time}`}
    </Text>
  );
}

export default CountdownTimer;
