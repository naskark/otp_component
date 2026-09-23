import React, {useMemo} from 'react';
import {Text, useColorScheme, View} from 'react-native';
import {getColors} from '../../theme';
import {createPaymentRiskBannerStyles} from './PaymentRiskBanner.styles';

export interface PaymentRiskBannerProps {
  amountLabel: string;
}

export function PaymentRiskBanner({amountLabel}: PaymentRiskBannerProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(() => createPaymentRiskBannerStyles(colors), [colors]);

  return (
    <View
      style={styles.banner}
      accessibilityRole="summary"
      accessibilityLabel={`High value transfer ${amountLabel}. Extra verification required.`}>
      <Text style={styles.title}>High-value transfer</Text>
      <Text style={styles.body}>
        Payment amount {amountLabel}. Verify payee details before OTP.
      </Text>
    </View>
  );
}
