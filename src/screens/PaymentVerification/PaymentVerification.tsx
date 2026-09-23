import React, {useMemo} from 'react';
import {Text, useColorScheme, View, StyleSheet} from 'react-native';
import {PaymentRiskBanner} from '../../components/PaymentRiskBanner';
import {OtpVerification} from '../OtpVerification';
import {getColors, typography} from '../../theme';
import type {PaymentContext} from '../../types/otp';

export const DEFAULT_PAYMENT: PaymentContext = {
  amount: '25,000',
  currencySymbol: '₹',
  beneficiaryName: 'Acme Corp',
  beneficiaryBank: 'National Bank',
  beneficiaryAccountMasked: '•••• 9012',
  fromAccountMasked: 'Savings •••• 3401',
  transactionId: 'pay-8842',
  destinationMasked: '+91 ******9012',
  destinationType: 'mobile',
};

export interface PaymentVerificationScreenProps {
  payment?: PaymentContext;
  onVerified?: () => void;
  onBack?: () => void;
}

export function PaymentVerificationScreen({
  payment = DEFAULT_PAYMENT,
  onVerified,
  onBack,
}: PaymentVerificationScreenProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const contextStyles = useMemo(
    () =>
      StyleSheet.create({
        amount: {
          ...typography.amount,
          color: colors.text,
          textAlign: 'center',
          marginBottom: 4,
        },
        line: {
          ...typography.caption,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 18,
          marginBottom: 4,
        },
      }),
    [colors],
  );

  const amountLabel = `${payment.currencySymbol}${payment.amount}`;
  const numericAmount = Number(payment.amount.replace(/,/g, ''));
  const showRiskBanner = numericAmount >= 10_000;

  return (
    <OtpVerification
      sessionId={payment.transactionId}
      destinationLabel={payment.destinationMasked}
      channel="sms"
      verifyLabel="Verify Payment"
      sessionInvalidationDelayMs={30_000}
      sessionInvalidationMessage="Payee details were updated. Request a new OTP to continue."
      onVerified={onVerified}
      onBack={onBack}
      contextSlot={
        <View accessibilityLabel="Payment details">
          {showRiskBanner ? (
            <PaymentRiskBanner amountLabel={amountLabel} />
          ) : null}
          <Text style={contextStyles.amount}>
            {payment.currencySymbol}
            {payment.amount}
          </Text>
          <Text style={contextStyles.line}>
            To: {payment.beneficiaryName} | {payment.beneficiaryBank}{' '}
            {payment.beneficiaryAccountMasked}
          </Text>
          <Text style={contextStyles.line}>
            From: {payment.fromAccountMasked}
          </Text>
          <Text style={contextStyles.line}>
            Transaction ID: {payment.transactionId}
          </Text>
        </View>
      }
    />
  );
}

export default PaymentVerificationScreen;
