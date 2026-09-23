export type OtpStatus =
  | 'idle'
  | 'editing'
  | 'ready'
  | 'verifying'
  | 'verified'
  | 'invalid'
  | 'locked'
  | 'resending'
  | 'resend-success'
  | 'network-error'
  | 'expired';

export type OtpChannel = 'sms' | 'email' | 'whatsapp';

export type VerificationErrorCode =
  | 'INVALID_OTP'
  | 'EXPIRED_OTP'
  | 'MAX_ATTEMPTS'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'SESSION_INVALID';

export interface VerifyOtpRequest {
  otp: string;
  transactionId: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  code?: VerificationErrorCode;
  remainingAttempts?: number;
}

export interface ResendOtpRequest {
  transactionId: string;
  channel: OtpChannel;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  otpExpiresAt: number;
  resendAvailableAt: number;
}

export interface PaymentContext {
  amount: string;
  currencySymbol: string;
  beneficiaryName: string;
  beneficiaryBank: string;
  beneficiaryAccountMasked: string;
  fromAccountMasked: string;
  transactionId: string;
  destinationMasked: string;
  destinationType: 'mobile' | 'email';
}

export interface UseOtpVerificationOptions {
  length?: number;
  transactionId: string;
  maxAttempts?: number;
  resendCooldownMs?: number;
  otpValidityMs?: number;
  channel?: OtpChannel;
  autoSubmit?: boolean;
  autoSubmitOnBulkFill?: boolean;
  correctOtp?: string;
  networkDelayMs?: number;
}
