# Project overview

React Native (TypeScript) app built around a reusable OTP verification module and several product flows.

## App navigation

- **Launch** — Login OTP screen (email channel); no back button until verified.
- **After login** — Home menu with flow cards.
- **Flows** — Payment, Change MPIN, Change Passcode, E-Signature, Add Beneficiary.
- **Completion** — Each flow saves “last verified” time and returns to home.

## Shared OTP module

- **`OtpVerification`** — Full-screen or **`layout: inline`** for embedding.
- **`OTPInput`** — Boxed digits, hidden input, autofill hooks, haptics, error/pulse/highlight states.
- **`useOtpVerification`** — OTP state, verify/resend, timers, lock/expiry, auto-submit.
- **`otpService`** — Local verify/resend client (~2s delay, per-session attempt tracking).
- **Props** — Session id, destination label, channel, title, verify label, optional context slot, biometric step, session invalidation, wrong-number sheet.

## OTP behaviour

- **Length** — 4–6 digits; cell layout scales with length.
- **Auto-verify** — On last digit and on paste/SMS bulk fill (configurable).
- **Attempts** — Max 3; lock after failures.
- **Expiry** — 5-minute OTP window.
- **Resend** — Cooldown timer; resets OTP and attempts on success.
- **Errors** — Invalid, expired, locked, network, session invalid.

## Auto-read (SMS / clipboard)

- **`useOtpAutoRead`** — Clipboard (session-aware), Android SMS consent/inbox, iOS one-time-code field.
- **`OtpFillSourceChip`** — Shows SMS vs clipboard fill.
- Toggle via env (`OTP_SMS_AUTO_READ`).

## Post-verify steps

- **Biometric sheet** — Optional confirm via `react-native-biometrics`; skip path if unavailable/cancelled.
- **Success sheet** — Configurable message and auto-dismiss.
- **`onVerified`** — Wired to app navigation / flow completion.

## Flow-specific screens

- **Login** — Email destination; gates app entry.
- **Payment** — Amount/beneficiary context, high-value risk banner, 30s session invalidation demo.
- **Beneficiary** — Payee details in context slot.
- **MPIN** — 4-digit entry + confirm, then inline OTP.
- **Passcode** — 6-digit new + confirm (stored locally), then inline OTP.
- **E-Signature** — Signature pad (draw, clear, continue); pad locked after continue; OTP inline; no scroll while signing.

## E-signature component

- **`SignaturePad`** — PanResponder drawing, editable/locked mode, stroke storage.
- **`hasSignatureInk`** — Validates before OTP step.

## Home

- Flow cards from **`FLOW_CARDS`** (login not listed; handled at launch).
- Relative “last verified” badges via **`verificationHistory`** (AsyncStorage).

## Environment (`.env`)

| Item                           | Brief                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| `OTP_LENGTH`                   | Digit count (4–6).                                                                         |
| `OTP_AUTO_SUBMIT`              | Verify when complete.                                                                      |
| `OTP_AUTO_SUBMIT_ON_BULK_FILL` | Verify on paste/SMS fill.                                                                  |
| `OTP_SMS_AUTO_READ`            | Enable auto-read pipeline.                                                                 |
| `OTP_RESEND_COOLDOWN_SECONDS`  | Resend wait (15–600 s).                                                                    |
| `OTP_VERIFY_CODE`              | Local dev verify value (match length).                                                     |
| `OTP_MSG_*`                    | Success, resend, expired, locked, network, invalid copy; `{attempts}` in invalid template. |

Parsed in **`src/config/otpEnv.ts`**.

## Supporting UI

- Countdown timer (resend).
- Verification button (loading/disabled).
- Wrong number bottom sheet.
- Payment risk banner.
- Light/dark theme tokens.

## Platform / native

- **Android** — SMS User Consent module for OTP SMS.
- **iOS** — Bundle id `com.otpcomponent.app`; `Signing.local.xcconfig` for `DEVELOPMENT_TEAM`.

## Tests

- Jest — Utils, `otpService`, `useOtpVerification`, `otpEnv` parsing, home cards, app launch screen, payment screen smoke.

## Key paths

- `src/screens/OtpVerification/` — OTP UI
- `src/hooks/useOtpVerification.ts` — Core logic
- `src/services/otpService.ts` — Verify/resend API shape
- `src/config/otpEnv.ts` — Env config
- `App.tsx` — Route switcher
