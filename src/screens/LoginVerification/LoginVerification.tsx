import React from 'react';
import {OtpVerification} from '../OtpVerification';

export interface LoginVerificationScreenProps {
  email?: string;
  sessionId?: string;
  onVerified?: () => void;
  onBack?: () => void;
}

export function LoginVerificationScreen({
  email = 'you@company.com',
  sessionId = 'auth-login',
  onVerified,
  onBack,
}: LoginVerificationScreenProps) {
  return (
    <OtpVerification
      sessionId={sessionId}
      destinationLabel={email}
      channel="email"
      verifyLabel="Verify"
      onVerified={onVerified}
      onBack={onBack}
    />
  );
}

export default LoginVerificationScreen;
