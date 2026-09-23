import {
  extractOtpFromText,
  formatCountdown,
  isCompleteOtp,
  remainingMs,
  sanitizeOtpInput,
} from '../otp';

describe('otp utils', () => {
  it('accepts exactly four digits', () => {
    expect(isCompleteOtp('8642', 4)).toBe(true);
    expect(isCompleteOtp('864', 4)).toBe(false);
    expect(isCompleteOtp('86420', 4)).toBe(false);
  });

  it('rejects non-numeric input via sanitize', () => {
    expect(sanitizeOtpInput('12ab34', 4)).toBe('1234');
    expect(sanitizeOtpInput('12 34', 4)).toBe('1234');
    expect(sanitizeOtpInput('abcd', 4)).toBe('');
  });

  it('never returns negative remaining time', () => {
    expect(remainingMs(Date.now() - 5_000)).toBe(0);
    expect(formatCountdown(-1000)).toBe('00:00');
  });

  it('formats countdown as mm:ss', () => {
    expect(formatCountdown(42_000)).toBe('00:42');
    expect(formatCountdown(154_000)).toBe('02:34');
  });

  it('extracts OTP from SMS-style clipboard text', () => {
    expect(extractOtpFromText('Your OTP is 8642. Do not share.', 4)).toBe(
      '8642',
    );
    expect(extractOtpFromText('Use code: 9032 to login', 4)).toBe('9032');
    expect(extractOtpFromText('8642', 4)).toBe('8642');
    expect(extractOtpFromText('no code here', 4)).toBeNull();
  });
});
