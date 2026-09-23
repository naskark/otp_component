import React, {useMemo} from 'react';
import {Text, useColorScheme, View} from 'react-native';
import {getColors} from '../../theme';
import {createOtpFillSourceChipStyles} from './OtpFillSourceChip.styles';
import type {OtpAutoReadSource} from '../../hooks/useOtpAutoRead';

export interface OtpFillSourceChipProps {
  source: OtpAutoReadSource;
}

const LABELS: Record<OtpAutoReadSource, string> = {
  sms: 'From SMS · just now',
  'sms-autofill': 'From autofill · just now',
  clipboard: 'From clipboard · just now',
};

export function OtpFillSourceChip({source}: OtpFillSourceChipProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(() => createOtpFillSourceChipStyles(colors), [colors]);

  return (
    <View style={styles.chip} accessibilityRole="text">
      <View style={styles.dot} />
      <Text style={styles.label}>{LABELS[source]}</Text>
    </View>
  );
}
