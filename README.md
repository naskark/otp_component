# OTP Component

React Native app with a shared OTP verification flow for login, payments, MPIN, passcode, e-signature, and beneficiaries.

## Setup

```bash
npm install
cp .env.example .env
npm start
```

```bash
npm run ios
# or
npm run android
```

### iOS

Workspace: `ios/otp_component.xcworkspace`. Signing: `DEVELOPMENT_TEAM` in `ios/Signing.local.xcconfig` (from `Signing.local.xcconfig.example`).

```bash
npm test
```

## Layout

- `src/screens/OtpVerification` — OTP UI
- `src/hooks/useOtpVerification.ts` — verify, resend, timers
- `src/services/otpService.ts` — verify/resend client (local implementation for now)
- `.env` — length, auto-submit, SMS read, resend interval, messages, dev verify code

## Configuration

Config template: `.env.example`. Metro reload required after env edits.

| Variable | Purpose |
|----------|---------|
| `OTP_LENGTH` | 4–6 digits |
| `OTP_AUTO_SUBMIT` | Verify when complete |
| `OTP_AUTO_SUBMIT_ON_BULK_FILL` | Verify on paste / SMS fill |
| `OTP_SMS_AUTO_READ` | Clipboard and Android SMS helpers |
| `OTP_RESEND_COOLDOWN_SECONDS` | 15–600 |
| `OTP_VERIFY_CODE` | Local dev verify value (match length) |
| `OTP_MSG_*` | User-visible strings; `{attempts}` in invalid template |

## Android SMS

Rebuild after native changes: `npm run android`. iOS uses keyboard one-time-code autofill.
