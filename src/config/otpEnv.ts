import {
  OTP_AUTO_SUBMIT,
  OTP_AUTO_SUBMIT_ON_BULK_FILL,
  OTP_LENGTH,
  OTP_MSG_EXPIRED,
  OTP_MSG_INVALID,
  OTP_MSG_LOCKED,
  OTP_MSG_LOCKED_UI,
  OTP_MSG_NETWORK,
  OTP_MSG_RESEND,
  OTP_MSG_RESEND_FAILED,
  OTP_MSG_SUCCESS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_SMS_AUTO_READ,
  OTP_VERIFY_CODE,
} from '@env';

const MIN_OTP_LENGTH = 4;
const MAX_OTP_LENGTH = 6;
const MIN_RESEND_SECONDS = 15;
const MAX_RESEND_SECONDS = 600;

export function parseBoolean(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  const normalized = raw.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

export function parseIntInRange(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number.parseInt(String(raw ?? '').trim(), 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

export function parseOtpLength(raw: string | undefined): number {
  return parseIntInRange(raw, MIN_OTP_LENGTH, MIN_OTP_LENGTH, MAX_OTP_LENGTH);
}

export function normalizeVerifyCode(
  raw: string | undefined,
  length: number,
): string {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.length === length) {
    return digits;
  }
  if (digits.length > length) {
    return digits.slice(0, length);
  }
  return digits.padEnd(length, '0').slice(0, length);
}

export function parseResendCooldownMs(raw: string | undefined): number {
  const seconds = parseIntInRange(
    raw,
    60,
    MIN_RESEND_SECONDS,
    MAX_RESEND_SECONDS,
  );
  return seconds * 1000;
}

function withFallback(raw: string | undefined, fallback: string): string {
  const trimmed = raw?.trim();
  return trimmed ? trimmed : fallback;
}

export function formatOtpEnvMessage(
  template: string,
  vars: {attempts?: number},
): string {
  let out = template;
  if (vars.attempts !== undefined) {
    const label =
      vars.attempts === 1 ? '1 attempt' : `${vars.attempts} attempts`;
    out = out.replace(/\{attempts\}/g, label);
  }
  return out;
}

const length = parseOtpLength(OTP_LENGTH);

export const otpEnv = {
  length,
  autoSubmit: parseBoolean(OTP_AUTO_SUBMIT, true),
  autoSubmitOnBulkFill: parseBoolean(OTP_AUTO_SUBMIT_ON_BULK_FILL, true),
  smsAutoRead: parseBoolean(OTP_SMS_AUTO_READ, true),
  resendCooldownMs: parseResendCooldownMs(OTP_RESEND_COOLDOWN_SECONDS),
  verifyCode: normalizeVerifyCode(OTP_VERIFY_CODE, length),
  messages: {
    success: withFallback(OTP_MSG_SUCCESS, 'Verified successfully.'),
    resend: withFallback(OTP_MSG_RESEND, 'A new OTP has been sent.'),
    expired: withFallback(
      OTP_MSG_EXPIRED,
      'OTP has expired. Please request a new one.',
    ),
    locked: withFallback(
      OTP_MSG_LOCKED,
      'Too many incorrect attempts. Verification is locked.',
    ),
    lockedUi: withFallback(
      OTP_MSG_LOCKED_UI,
      'Verification locked. Try again later.',
    ),
    network: withFallback(
      OTP_MSG_NETWORK,
      'Unable to reach the server. Please try again.',
    ),
    resendFailed: withFallback(
      OTP_MSG_RESEND_FAILED,
      'Unable to resend OTP. Please try again.',
    ),
    invalidTemplate: withFallback(
      OTP_MSG_INVALID,
      'Incorrect OTP. {attempts} remaining.',
    ),
  },
  invalidMessage(remainingAttempts: number): string {
    return formatOtpEnvMessage(this.messages.invalidTemplate, {
      attempts: remainingAttempts,
    });
  },
} as const;
