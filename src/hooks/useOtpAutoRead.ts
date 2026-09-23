import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import {AppState, Clipboard, Platform, type AppStateStatus} from 'react-native';
import {
  getSmsAutoReadStatus,
  isSmsAutoReadSupported,
  isSmsModuleLinked,
  pollLatestInboxSms,
  refreshSmsListeningAfterPermission,
  requestSmsPermissionAutomatic,
  startSmsAutoRead,
  waitForAndroidActivityReady,
} from '../services/smsOtpAutoRead';
import {extractOtpFromText} from '../utils/otp';

export type OtpAutoReadSource = 'sms' | 'sms-autofill' | 'clipboard';

export interface UseOtpAutoReadOptions {
  length?: number;
  enabled?: boolean;
  currentValue?: string;
  onOtp: (otp: string, source: OtpAutoReadSource) => void;
}

function markSessionStart(
  sessionSinceMsRef: MutableRefObject<number>,
  lastInboxDateMsRef: MutableRefObject<number>,
  clipboardBaselineRef: MutableRefObject<string | null>,
) {
  sessionSinceMsRef.current = Date.now();
  lastInboxDateMsRef.current = 0;
  if (typeof Clipboard?.getString === 'function') {
    Clipboard.getString()
      .then(text => {
        clipboardBaselineRef.current = text;
      })
      .catch(() => {
        clipboardBaselineRef.current = null;
      });
  } else {
    clipboardBaselineRef.current = null;
  }
}

export function useOtpAutoRead({
  length = 4,
  enabled = true,
  currentValue = '',
  onOtp,
}: UseOtpAutoReadOptions) {
  const onOtpRef = useRef(onOtp);
  onOtpRef.current = onOtp;
  const lastAppliedRef = useRef<string | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const currentLengthRef = useRef(currentValue.length);
  currentLengthRef.current = currentValue.length;
  const permissionBootRef = useRef(false);

  const sessionSinceMsRef = useRef(Date.now());
  const lastInboxDateMsRef = useRef(0);
  const clipboardBaselineRef = useRef<string | null>(null);
  const prevOtpLengthRef = useRef(currentValue.length);

  const [smsPermissionGranted, setSmsPermissionGranted] = useState(false);
  const [smsModuleLinked, setSmsModuleLinked] = useState(
    isSmsModuleLinked(),
  );
  const [inputFocusReady, setInputFocusReady] = useState(
    Platform.OS !== 'android',
  );

  const tryApplyFromText = useCallback(
    (text: string, source: OtpAutoReadSource) => {
      if (!enabledRef.current) {
        return false;
      }
      if (currentLengthRef.current === length) {
        return false;
      }
      const otp = extractOtpFromText(text, length);
      if (!otp || otp === lastAppliedRef.current) {
        return false;
      }
      lastAppliedRef.current = otp;
      onOtpRef.current(otp, source);
      return true;
    },
    [length],
  );

  const tryApplyRef = useRef(tryApplyFromText);
  tryApplyRef.current = tryApplyFromText;

  useEffect(() => {
    if (!enabled) {
      return;
    }
    markSessionStart(
      sessionSinceMsRef,
      lastInboxDateMsRef,
      clipboardBaselineRef,
    );
  }, [enabled]);

  useEffect(() => {
    if (currentValue.length === 0 && prevOtpLengthRef.current > 0) {
      markSessionStart(
        sessionSinceMsRef,
        lastInboxDateMsRef,
        clipboardBaselineRef,
      );
      lastAppliedRef.current = null;
    }
    prevOtpLengthRef.current = currentValue.length;
    if (currentValue.length === 0) {
      lastAppliedRef.current = null;
    }
  }, [currentValue]);

  const pollInboxForNewSms = useCallback(async () => {
    const sinceMs = sessionSinceMsRef.current;
    const result = await pollLatestInboxSms(sinceMs);
    if (!result) {
      return;
    }
    if (result.dateMs <= lastInboxDateMsRef.current) {
      return;
    }
    lastInboxDateMsRef.current = result.dateMs;
    tryApplyRef.current(result.message, 'sms');
  }, []);

  const refreshPermissionState = useCallback(async () => {
    const status = await getSmsAutoReadStatus();
    setSmsModuleLinked(status.moduleLinked);
    setSmsPermissionGranted(status.hasPermission);
    return status;
  }, []);

  const readClipboard = useCallback(async () => {
    if (!enabled) {
      return;
    }
    try {
      if (typeof Clipboard?.getString !== 'function') {
        return;
      }
      const text = await Clipboard.getString();
      if (!text || text === clipboardBaselineRef.current) {
        return;
      }
      tryApplyFromText(text, 'clipboard');
    } catch {
      // ignore
    }
  }, [enabled, tryApplyFromText]);

  useEffect(() => {
    refreshPermissionState();
  }, [refreshPermissionState]);

  useEffect(() => {
    if (!enabled || !isSmsAutoReadSupported()) {
      setInputFocusReady(true);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !isSmsAutoReadSupported()) {
      return;
    }
    if (permissionBootRef.current) {
      return;
    }
    permissionBootRef.current = true;
    setInputFocusReady(false);

    let cancelled = false;

    (async () => {
      try {
        await waitForAndroidActivityReady();
        if (cancelled) {
          return;
        }

        await requestSmsPermissionAutomatic();
        if (cancelled) {
          return;
        }

        await refreshPermissionState();
        if (isSmsModuleLinked()) {
          await refreshSmsListeningAfterPermission();
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('[SmsAutoRead] permission boot failed', error);
        }
      } finally {
        if (!cancelled) {
          markSessionStart(
            sessionSinceMsRef,
            lastInboxDateMsRef,
            clipboardBaselineRef,
          );
          setInputFocusReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      permissionBootRef.current = false;
    };
  }, [enabled, refreshPermissionState]);

  useEffect(() => {
    if (!enabled || !isSmsAutoReadSupported()) {
      return;
    }

    let stop: (() => void) | undefined;
    let cancelled = false;

    startSmsAutoRead(message => {
      tryApplyRef.current(message, 'sms');
    })
      .then(cleanup => {
        if (cancelled) {
          cleanup();
          return;
        }
        stop = cleanup;
      })
      .catch(error => {
        if (__DEV__) {
          console.warn('[SmsAutoRead] start failed', error);
        }
      });

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !smsPermissionGranted || !smsModuleLinked) {
      return;
    }

    const poll = () => {
      pollInboxForNewSms();
    };

    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [enabled, pollInboxForNewSms, smsModuleLinked, smsPermissionGranted]);

  useEffect(() => {
    if (!enabled || Platform.OS !== 'ios') {
      return;
    }

    const bootId = setTimeout(() => {
      readClipboard();
    }, 350);

    const onAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        readClipboard();
        refreshPermissionState();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);

    const pollId = setInterval(readClipboard, 1500);

    return () => {
      clearTimeout(bootId);
      clearInterval(pollId);
      sub.remove();
    };
  }, [enabled, readClipboard, refreshPermissionState]);

  const resetAutoRead = useCallback(() => {
    lastAppliedRef.current = null;
    markSessionStart(
      sessionSinceMsRef,
      lastInboxDateMsRef,
      clipboardBaselineRef,
    );
  }, []);

  return {
    readClipboard,
    resetAutoRead,
    inputFocusReady,
    smsSupported: isSmsAutoReadSupported(),
    smsModuleLinked,
    smsPermissionGranted,
    refreshPermissionState,
  };
}
