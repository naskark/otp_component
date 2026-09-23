import {
  isCompletePasscode,
  passcodesMatch,
  sanitizePasscodeInput,
} from '../passcode';

describe('passcode utils', () => {
  it('sanitizes to six digits', () => {
    expect(sanitizePasscodeInput('12ab345678')).toBe('123456');
  });

  it('validates complete passcode', () => {
    expect(isCompletePasscode('123456')).toBe(true);
    expect(isCompletePasscode('12345')).toBe(false);
  });

  it('checks match', () => {
    expect(passcodesMatch('482910', '482910')).toBe(true);
    expect(passcodesMatch('482910', '482911')).toBe(false);
  });
});
