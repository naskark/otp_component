import {otpEnv} from '../config/otpEnv';
import type {
  ResendOtpRequest,
  ResendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '../types/otp';

export const OTP_API_DELAY_MS = 2000;

const OTP_VALIDITY_MS = 5 * 60_000;

export interface OtpServiceConfig {
  correctOtp?: string;
  maxAttempts?: number;
  networkDelayMs?: number;
  forceNetworkError?: boolean;
}

let attemptStore = new Map<string, number>();

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createOtpService(config: OtpServiceConfig = {}) {
  const {
    correctOtp = otpEnv.verifyCode,
    maxAttempts = 3,
    networkDelayMs = OTP_API_DELAY_MS,
    forceNetworkError = false,
  } = config;

  return {
    async verifyOtp({
      otp,
      transactionId,
    }: VerifyOtpRequest): Promise<VerifyOtpResponse> {
      console.log(`OTP entered: ${otp}`);
      await delay(networkDelayMs);

      if (forceNetworkError) {
        return {
          success: false,
          message: otpEnv.messages.network,
          code: 'NETWORK_ERROR',
        };
      }

      const used = attemptStore.get(transactionId) ?? 0;
      if (used >= maxAttempts) {
        return {
          success: false,
          message: otpEnv.messages.locked,
          code: 'MAX_ATTEMPTS',
          remainingAttempts: 0,
        };
      }

      if (otp === correctOtp) {
        attemptStore.set(transactionId, 0);
        return {
          success: true,
          message: otpEnv.messages.success,
        };
      }

      const next = used + 1;
      attemptStore.set(transactionId, next);
      const remainingAttempts = Math.max(0, maxAttempts - next);

      if (remainingAttempts === 0) {
        return {
          success: false,
          message: otpEnv.messages.locked,
          code: 'MAX_ATTEMPTS',
          remainingAttempts: 0,
        };
      }

      return {
        success: false,
        message: otpEnv.invalidMessage(remainingAttempts),
        code: 'INVALID_OTP',
        remainingAttempts,
      };
    },

    async resendOtp(_request: ResendOtpRequest): Promise<ResendOtpResponse> {
      await delay(networkDelayMs);

      if (forceNetworkError) {
        throw new Error('NETWORK_ERROR');
      }

      const now = Date.now();
      return {
        success: true,
        message: otpEnv.messages.resend,
        otpExpiresAt: now + OTP_VALIDITY_MS,
        resendAvailableAt: now + otpEnv.resendCooldownMs,
      };
    },

    resetAttempts(transactionId?: string) {
      if (transactionId) {
        attemptStore.delete(transactionId);
      } else {
        attemptStore = new Map();
      }
    },
  };
}

export const otpService = createOtpService();
