import type {ReactNode} from 'react';
import type {OtpChannel} from '../../types/otp';

export interface OtpVerificationProps {
  sessionId: string;
  title?: string;
  destinationLabel: string;
  destinationType?: 'mobile' | 'email';
  channel?: OtpChannel;
  contextSlot?: ReactNode;
  verifyLabel?: string;
  successMessage?: string;
  successAutoDismissMs?: number;
  autoSubmit?: boolean;
  autoSubmitOnBulkFill?: boolean;
  correctOtp?: string;
  enableBiometricStep?: boolean;
  sessionInvalidationDelayMs?: number;
  sessionInvalidationMessage?: string;
  showWrongNumberLink?: boolean;
  layout?: 'screen' | 'inline';
  onVerified?: () => void;
  onBack?: () => void;
}
