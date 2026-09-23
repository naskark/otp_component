export function sanitizeOtpInput(raw: string, length: number): string {
  return raw.replace(/\D/g, '').slice(0, length);
}

export function isCompleteOtp(value: string, length: number): boolean {
  return value.length === length && /^\d+$/.test(value);
}

export function extractOtpFromText(
  text: string,
  length = 4,
): string | null {
  if (!text) {
    return null;
  }

  const escapedLength = String(length);
  const labeled = text.match(
    new RegExp(
      `(?:otp|code|pin|passcode)[^0-9]{0,12}(\\d{${escapedLength}})`,
      'i',
    ),
  );
  if (labeled?.[1]) {
    return labeled[1];
  }

  // Avoid lookbehind for broader Hermes / JS engine support.
  const standalone = text.match(
    new RegExp(`(?:^|\\D)(\\d{${escapedLength}})(?:\\D|$)`),
  );
  if (standalone?.[1]) {
    return standalone[1];
  }

  // Last resort: first contiguous digit run of exact length.
  const digitsOnly = text.replace(/\D/g, '');
  if (digitsOnly.length === length) {
    return digitsOnly;
  }

  return null;
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function remainingMs(expiresAt: number, now = Date.now()): number {
  return Math.max(0, expiresAt - now);
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) {
    return '••••';
  }
  return `+91 ******${digits.slice(-4)}`;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) {
    return email;
  }
  if (local.length <= 2) {
    return `${local[0] ?? '*'}***@${domain}`;
  }
  return `${local.slice(0, 2)}***@${domain}`;
}
