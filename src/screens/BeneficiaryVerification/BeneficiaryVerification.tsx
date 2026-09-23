import React, {useMemo} from 'react';
import {StyleSheet, Text, useColorScheme, View} from 'react-native';
import {OtpVerification} from '../OtpVerification';
import {getColors, typography} from '../../theme';

export interface BeneficiaryVerificationScreenProps {
  onVerified?: () => void;
  onBack?: () => void;
}

const BENEFICIARY = {
  sessionId: 'ben-add-4410',
  name: 'Vendor account',
  bank: 'National Bank',
  accountMasked: '•••• 4410',
  ifsc: 'NBKN0004410',
  destination: '+91 ******4410',
};

export function BeneficiaryVerificationScreen({
  onVerified,
  onBack,
}: BeneficiaryVerificationScreenProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const contextStyles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          ...typography.bodyBold,
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
        warning: {
          ...typography.caption,
          color: colors.warning,
          textAlign: 'center',
          marginTop: 8,
        },
      }),
    [colors],
  );

  return (
    <OtpVerification
      sessionId={BENEFICIARY.sessionId}
      destinationLabel={BENEFICIARY.destination}
      channel="sms"
      verifyLabel="Verify Beneficiary"
      onVerified={onVerified}
      onBack={onBack}
      contextSlot={
        <View accessibilityLabel="New beneficiary details">
          <Text style={contextStyles.title}>{BENEFICIARY.name}</Text>
          <Text style={contextStyles.line}>
            {BENEFICIARY.bank} {BENEFICIARY.accountMasked}
          </Text>
          <Text style={contextStyles.line}>IFSC: {BENEFICIARY.ifsc}</Text>
          <Text style={contextStyles.warning}>
            Confirm these details before you verify.
          </Text>
        </View>
      }
    />
  );
}

export default BeneficiaryVerificationScreen;
