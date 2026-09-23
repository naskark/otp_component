import {
  formatOtpEnvMessage,
  parseBoolean,
  normalizeVerifyCode,
  parseOtpLength,
  parseResendCooldownMs,
} from '../otpEnv';

describe('otpEnv parsing', () => {
  it('clamps OTP length between 4 and 6', () => {
    expect(parseOtpLength('3')).toBe(4);
    expect(parseOtpLength('5')).toBe(5);
    expect(parseOtpLength('9')).toBe(6);
  });

  it('parses booleans and resend cooldown', () => {
    expect(parseBoolean('true', false)).toBe(true);
    expect(parseBoolean('0', true)).toBe(false);
    expect(parseResendCooldownMs('30')).toBe(30_000);
    expect(parseResendCooldownMs('120')).toBe(120_000);
  });

  it('normalizes verify code to configured length', () => {
    expect(normalizeVerifyCode('1357', 6)).toBe('135700');
    expect(normalizeVerifyCode('1234567', 4)).toBe('1234');
  });

  it('formats invalid message template', () => {
    expect(
      formatOtpEnvMessage('Wrong. {attempts}.', {attempts: 2}),
    ).toBe('Wrong. 2 attempts.');
    expect(
      formatOtpEnvMessage('Wrong. {attempts}.', {attempts: 1}),
    ).toBe('Wrong. 1 attempt.');
  });
});
