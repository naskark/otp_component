import {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, type AppStateStatus} from 'react-native';
import {otpEnv} from '../config/otpEnv';
import {createOtpService, OTP_API_DELAY_MS} from '../services/otpService';
import type {
  OtpChannel,
  OtpStatus,
  UseOtpVerificationOptions,
  VerificationErrorCode,
} from '../types/otp';
import {isCompleteOtp, remainingMs, sanitizeOtpInput} from '../utils/otp';

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_VALIDITY_MS = 5 * 60_000;

export interface UseOtpVerificationResult {
  otp: string;
  status: OtpStatus;
  error: string | null;
  errorCode: VerificationErrorCode | null;
  remainingAttempts: number;
  resendRemainingMs: number;
  expiryRemainingMs: number;
  canResend: boolean;
  canVerify: boolean;
  isVerifying: boolean;
  isResending: boolean;
  isLocked: boolean;
  isVerified: boolean;
  setOtp: (value: string) => void;
  verify: () => Promise<void>;
  resend: () => Promise<void>;
  reset: () => void;
  clearError: () => void;
  invalidateSession: (message: string) => void;
}

export function useOtpVerification(
  options: UseOtpVerificationOptions,
): UseOtpVerificationResult {
  const {
    length = otpEnv.length,
    transactionId,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    resendCooldownMs = otpEnv.resendCooldownMs,
    otpValidityMs = DEFAULT_VALIDITY_MS,
    channel = 'sms' as OtpChannel,
    autoSubmit = otpEnv.autoSubmit,
    autoSubmitOnBulkFill = otpEnv.autoSubmitOnBulkFill,
    correctOtp = otpEnv.verifyCode,
    networkDelayMs = OTP_API_DELAY_MS,
  } = options;

  const serviceRef = useRef(
    createOtpService({correctOtp, maxAttempts, networkDelayMs}),
  );

  useEffect(() => {
    serviceRef.current = createOtpService({
      correctOtp,
      maxAttempts,
      networkDelayMs,
    });
  }, [correctOtp, maxAttempts, networkDelayMs]);

  const [otp, setOtpState] = useState('');
  const [status, setStatus] = useState<OtpStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<VerificationErrorCode | null>(
    null,
  );
  const [remainingAttempts, setRemainingAttempts] = useState(maxAttempts);
  const [resendExpiresAt, setResendExpiresAt] = useState(
    () => Date.now() + resendCooldownMs,
  );
  const [otpExpiresAt, setOtpExpiresAt] = useState(
    () => Date.now() + otpValidityMs,
  );
  const [now, setNow] = useState(() => Date.now());

  const verifyingRef = useRef(false);
  const autoSubmitFiredRef = useRef(false);
  const otpRef = useRef('');
  const statusRef = useRef(status);
  const remainingAttemptsRef = useRef(remainingAttempts);
  const otpExpiresAtRef = useRef(otpExpiresAt);
  otpRef.current = otp;
  statusRef.current = status;
  remainingAttemptsRef.current = remainingAttempts;
  otpExpiresAtRef.current = otpExpiresAt;

  const tick = useCallback(() => {
    setNow(Date.now());
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'active') {
        tick();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [tick]);

  const resendRemainingMs = remainingMs(resendExpiresAt, now);
  const expiryRemainingMs = remainingMs(otpExpiresAt, now);
  const canResend =
    resendRemainingMs === 0 &&
    status !== 'verifying' &&
    status !== 'resending' &&
    status !== 'verified' &&
    status !== 'locked';
  const isLocked = status === 'locked' || remainingAttempts <= 0;
  const isVerified = status === 'verified';
  const isVerifying = status === 'verifying';
  const isResending = status === 'resending';
  const canVerify =
    isCompleteOtp(otp, length) &&
    !isVerifying &&
    !isLocked &&
    !isVerified &&
    expiryRemainingMs > 0;

  useEffect(() => {
    if (expiryRemainingMs === 0 && status !== 'verified' && status !== 'locked') {
      setStatus(prev => (prev === 'expired' ? prev : 'expired'));
      setError(otpEnv.messages.expired);
      setErrorCode('EXPIRED_OTP');
    }
  }, [expiryRemainingMs, status]);

  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  const runVerify = useCallback(
    async (codeOverride?: string) => {
      const code = codeOverride ?? otpRef.current;
      const expiryLeft = Math.max(0, otpExpiresAtRef.current - Date.now());
      const locked =
        statusRef.current === 'locked' ||
        remainingAttemptsRef.current <= 0;
      const verified = statusRef.current === 'verified';

      if (
        !isCompleteOtp(code, length) ||
        verifyingRef.current ||
        locked ||
        verified ||
        expiryLeft <= 0
      ) {
        return;
      }

      verifyingRef.current = true;
      setStatus('verifying');
      clearError();

      try {
        const result = await serviceRef.current.verifyOtp({
          otp: code,
          transactionId,
        });

        if (result.success) {
          setStatus('verified');
          setError(null);
          setErrorCode(null);
          return;
        }

        if (typeof result.remainingAttempts === 'number') {
          setRemainingAttempts(result.remainingAttempts);
        }

        if (result.code === 'MAX_ATTEMPTS') {
          setStatus('locked');
          setRemainingAttempts(0);
        } else if (
          result.code === 'NETWORK_ERROR' ||
          result.code === 'TIMEOUT'
        ) {
          setStatus('network-error');
        } else {
          setStatus('invalid');
          setOtpState('');
          otpRef.current = '';
          autoSubmitFiredRef.current = false;
        }

        setError(result.message);
        setErrorCode(result.code ?? 'INVALID_OTP');
      } catch {
        setStatus('network-error');
        setError(otpEnv.messages.network);
        setErrorCode('NETWORK_ERROR');
      } finally {
        verifyingRef.current = false;
      }
    },
    [clearError, length, transactionId],
  );

  const verify = useCallback(async () => {
    await runVerify();
  }, [runVerify]);

  const scheduleAutoVerify = useCallback(
    (code: string) => {
      if (autoSubmitFiredRef.current) {
        return;
      }
      autoSubmitFiredRef.current = true;
      queueMicrotask(() => {
        void runVerify(code);
      });
    },
    [runVerify],
  );

  const setOtp = useCallback(
    (raw: string) => {
      if (isLocked || isVerified || isVerifying) {
        return;
      }
      const previous = otpRef.current;
      const next = sanitizeOtpInput(raw, length);
      const digitDelta = next.length - previous.length;
      const isBulkFill =
        isCompleteOtp(next, length) &&
        (digitDelta > 1 || (previous.length === 0 && next.length === length));

      setOtpState(next);
      otpRef.current = next;
      clearError();

      if (next.length < length) {
        autoSubmitFiredRef.current = false;
      }

      if (next.length === 0) {
        setStatus('idle');
      } else if (next.length < length) {
        setStatus('editing');
      } else {
        setStatus('ready');
      }

      if (autoSubmitOnBulkFill && isBulkFill) {
        scheduleAutoVerify(next);
      }
    },
    [
      autoSubmitOnBulkFill,
      clearError,
      isLocked,
      isVerified,
      isVerifying,
      length,
      scheduleAutoVerify,
    ],
  );

  useEffect(() => {
    if (
      autoSubmit &&
      isCompleteOtp(otp, length) &&
      !autoSubmitFiredRef.current &&
      canVerify
    ) {
      scheduleAutoVerify(otp);
    }
  }, [autoSubmit, canVerify, length, otp, scheduleAutoVerify]);

  const resend = useCallback(async () => {
    if (!canResend) {
      return;
    }
    setStatus('resending');
    clearError();

    try {
      const result = await serviceRef.current.resendOtp({
        transactionId,
        channel,
      });
      setOtpState('');
      otpRef.current = '';
      autoSubmitFiredRef.current = false;
      setResendExpiresAt(result.resendAvailableAt);
      setOtpExpiresAt(result.otpExpiresAt);
      setRemainingAttempts(maxAttempts);
      setStatus('resend-success');
      setError(null);
      setErrorCode(null);
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setStatus('network-error');
      setError(otpEnv.messages.resendFailed);
      setErrorCode('NETWORK_ERROR');
    }
  }, [canResend, channel, clearError, maxAttempts, transactionId]);

  const reset = useCallback(() => {
    serviceRef.current.resetAttempts(transactionId);
    setOtpState('');
    otpRef.current = '';
    setStatus('idle');
    setError(null);
    setErrorCode(null);
    setRemainingAttempts(maxAttempts);
    const t = Date.now();
    setResendExpiresAt(t + resendCooldownMs);
    setOtpExpiresAt(t + otpValidityMs);
    autoSubmitFiredRef.current = false;
    verifyingRef.current = false;
  }, [maxAttempts, otpValidityMs, resendCooldownMs, transactionId]);

  const invalidateSession = useCallback((message: string) => {
    setOtpState('');
    otpRef.current = '';
    autoSubmitFiredRef.current = false;
    verifyingRef.current = false;
    setOtpExpiresAt(Date.now());
    setStatus('idle');
    setError(message);
    setErrorCode('SESSION_INVALID');
  }, []);

  return {
    otp,
    status,
    error,
    errorCode,
    remainingAttempts,
    resendRemainingMs,
    expiryRemainingMs,
    canResend,
    canVerify,
    isVerifying,
    isResending,
    isLocked,
    isVerified,
    setOtp,
    verify,
    resend,
    reset,
    clearError,
    invalidateSession,
  };
}
