export const PASSCODE_LENGTH = 6;

export function sanitizePasscodeInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, PASSCODE_LENGTH);
}

export function isCompletePasscode(value: string): boolean {
  return (
    value.length === PASSCODE_LENGTH && /^\d+$/.test(value)
  );
}

export function passcodesMatch(a: string, b: string): boolean {
  return isCompletePasscode(a) && a === b;
}
