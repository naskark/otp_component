import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BiometricConfirmSheet} from '../../components/BiometricConfirmSheet';
import {CountdownTimer} from '../../components/CountdownTimer';
import {OtpFillSourceChip} from '../../components/OtpFillSourceChip';
import {OTPInput} from '../../components/OTPInput';
import {VerificationButton} from '../../components/VerificationButton';
import {VerificationSuccessSheet} from '../../components/VerificationSuccessSheet';
import {WrongNumberSheet} from '../../components/WrongNumberSheet';
import type {OtpAutoReadSource} from '../../hooks/useOtpAutoRead';
import {otpEnv} from '../../config/otpEnv';
import {useOtpVerification} from '../../hooks/useOtpVerification';
import {getColors} from '../../theme';
import {formatCountdown} from '../../utils/otp';
import {createOtpVerificationStyles} from './OtpVerification.styles';
import type {OtpVerificationProps} from './OtpVerification.types';

const OTP_VALIDITY_MS = 5 * 60_000;

export function OtpVerification({
  sessionId,
  title = 'OTP Verification',
  destinationLabel,
  channel = 'sms',
  contextSlot,
  verifyLabel = 'Verify',
  successMessage = otpEnv.messages.success,
  successAutoDismissMs = 3000,
  autoSubmit = otpEnv.autoSubmit,
  autoSubmitOnBulkFill = otpEnv.autoSubmitOnBulkFill,
  correctOtp = otpEnv.verifyCode,
  enableBiometricStep = true,
  sessionInvalidationDelayMs,
  sessionInvalidationMessage = 'Session details changed. Request a new OTP.',
  showWrongNumberLink = true,
  layout = 'screen',
  onVerified,
  onBack,
}: OtpVerificationProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(
    () => createOtpVerificationStyles(colors),
    [colors],
  );

  const [autoReadHint, setAutoReadHint] = useState<string | null>(null);
  const [fillSource, setFillSource] = useState<OtpAutoReadSource | null>(null);
  const [fillHighlight, setFillHighlight] = useState(false);
  const [attemptPulse, setAttemptPulse] = useState(false);
  const [showWrongNumber, setShowWrongNumber] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const verifiedHandledRef = useRef(false);

  const {
    otp,
    setOtp,
    status,
    error,
    remainingAttempts,
    resendRemainingMs,
    canResend,
    canVerify,
    isVerifying,
    isResending,
    isLocked,
    isVerified,
    verify,
    resend,
    reset,
    invalidateSession,
  } = useOtpVerification({
    length: otpEnv.length,
    transactionId: sessionId,
    maxAttempts: 3,
    resendCooldownMs: otpEnv.resendCooldownMs,
    otpValidityMs: OTP_VALIDITY_MS,
    channel,
    autoSubmit,
    autoSubmitOnBulkFill,
    correctOtp,
  });

  useEffect(() => {
    if (!isVerified || verifiedHandledRef.current) {
      return;
    }
    verifiedHandledRef.current = true;
    if (enableBiometricStep) {
      setShowBiometric(true);
    } else {
      setShowSuccessSheet(true);
    }
  }, [enableBiometricStep, isVerified]);

  useEffect(() => {
    if (!sessionInvalidationDelayMs) {
      return;
    }
    const id = setTimeout(() => {
      if (!isVerified && !isVerifying) {
        invalidateSession(sessionInvalidationMessage);
        setFillSource(null);
      }
    }, sessionInvalidationDelayMs);
    return () => clearTimeout(id);
  }, [
    invalidateSession,
    isVerified,
    isVerifying,
    sessionInvalidationDelayMs,
    sessionInvalidationMessage,
  ]);

  useEffect(() => {
    if (status === 'invalid' && remainingAttempts > 0 && remainingAttempts < 3) {
      setAttemptPulse(true);
      const id = setTimeout(() => setAttemptPulse(false), 1200);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [remainingAttempts, status]);

  const handleSuccessComplete = useCallback(() => {
    setShowSuccessSheet(false);
    onVerified?.();
  }, [onVerified]);

  const handleBiometricConfirm = useCallback(() => {
    setShowBiometric(false);
    setShowSuccessSheet(true);
  }, []);

  const handleBiometricCancel = useCallback(() => {
    setShowBiometric(false);
    verifiedHandledRef.current = false;
    reset();
  }, [reset]);

  const feedbackMessage = (() => {
    if (isVerified) {
      return '';
    }
    if (status === 'resend-success') {
      return otpEnv.messages.resend;
    }
    if (error) {
      if (status === 'invalid' && remainingAttempts > 0 && remainingAttempts < 3) {
        return error;
      }
      return error;
    }
    if (isLocked) {
      return otpEnv.messages.lockedUi;
    }
    if (autoReadHint) {
      return autoReadHint;
    }
    return '';
  })();

  const feedbackStyle = isVerified
    ? styles.feedbackSuccess
    : error || isLocked
      ? styles.feedbackError
      : styles.feedbackInfo;

  const inputDisabled = isVerifying || isLocked || isVerified;
  const isInline = layout === 'inline';

  const formContent = (
    <View style={isInline ? styles.inlineBlock : styles.content}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>

            <Text style={styles.instruction}>
              Enter the verification code we just sent you on{'\n'}
              <Text style={styles.instructionBold}>{destinationLabel}</Text>
            </Text>

            {showWrongNumberLink ? (
              <Pressable
                onPress={() => setShowWrongNumber(true)}
                accessibilityRole="button"
                accessibilityLabel="Wrong number">
                <Text style={styles.wrongNumberLink}>Wrong number?</Text>
              </Pressable>
            ) : null}

            {contextSlot ? (
              <View style={styles.contextSlot}>{contextSlot}</View>
            ) : null}

            <View style={styles.otpSection}>
              {fillSource ? <OtpFillSourceChip source={fillSource} /> : null}

              <OTPInput
                length={otpEnv.length}
                value={otp}
                onChange={value => {
                  setAutoReadHint(null);
                  if (value.length < otpEnv.length) {
                    setFillSource(null);
                  }
                  setOtp(value);
                }}
                disabled={inputDisabled}
                error={status === 'invalid' || status === 'network-error'}
                fillHighlight={fillHighlight}
                attemptPulse={attemptPulse}
                autoFocus
                autoRead={otpEnv.smsAutoRead && !isVerified}
                onAutoRead={(_code, source) => {
                  setFillSource(source);
                  setFillHighlight(true);
                  setTimeout(() => setFillHighlight(false), 900);
                  setAutoReadHint(
                    source === 'clipboard'
                      ? 'Code filled from clipboard.'
                      : 'Code filled from SMS.',
                  );
                }}
                accessibilityLabel="One-time password"
              />

              <View style={styles.timers}>
                {!canResend && !isVerified && (
                  <CountdownTimer
                    remainingMs={resendRemainingMs}
                    label="Resend OTP in"
                  />
                )}
              </View>

              {(!!feedbackMessage ||
                (!isVerified &&
                  remainingAttempts < 3 &&
                  remainingAttempts > 0)) && (
                <View style={styles.feedbackStack}>
                  {!!feedbackMessage && (
                    <Text
                      style={[styles.feedback, feedbackStyle]}
                      accessibilityLiveRegion="polite">
                      {feedbackMessage}
                    </Text>
                  )}
                  {!isVerified &&
                    remainingAttempts < 3 &&
                    remainingAttempts > 0 && (
                      <Text style={[styles.feedback, styles.feedbackInfo]}>
                        {remainingAttempts} attempt
                        {remainingAttempts === 1 ? '' : 's'} remaining
                      </Text>
                    )}
                </View>
              )}
            </View>

            <View style={styles.buttonWrap}>
              <VerificationButton
                label={isVerified ? 'Verified' : verifyLabel}
                onPress={verify}
                disabled={!canVerify}
                loading={isVerifying}
                accessibilityLabel={verifyLabel}
              />
            </View>

            <Pressable
              onPress={resend}
              disabled={!canResend || isResending}
              style={styles.resendPressable}
              accessibilityRole="button"
              accessibilityState={{disabled: !canResend || isResending, busy: isResending}}
              accessibilityLabel={
                isResending
                  ? 'Sending new OTP'
                  : canResend
                    ? 'Resend OTP'
                    : `Resend available in ${formatCountdown(resendRemainingMs)}`
              }
              hitSlop={8}>
              {isResending ? (
                <View style={styles.resendLoaderRow}>
                  <ActivityIndicator size="small" color={colors.text} />
                  <Text style={[styles.resendRow, styles.resendDisabled]}>
                    Sending new code…
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.resendRow,
                    !canResend && styles.resendDisabled,
                  ]}>
                  {canResend
                    ? (
                        <>
                          Didn't receive the code?{' '}
                          <Text style={styles.resendAction}>Resend</Text>
                        </>
                      )
                    : `Didn't receive the code? Resend in ${formatCountdown(
                        resendRemainingMs,
                      )}`}
                </Text>
              )}
            </Pressable>

            <View style={styles.securityNotice}>
              <Text style={styles.securityText}>
                OTP must not be shared. It is not requested over calls, chat, or
                email.
              </Text>
            </View>
          </View>
  );

  const sheets = (
    <>
      <WrongNumberSheet
        visible={showWrongNumber}
        destinationLabel={destinationLabel}
        onClose={() => setShowWrongNumber(false)}
      />

      <BiometricConfirmSheet
        visible={showBiometric}
        onConfirm={handleBiometricConfirm}
        onCancel={handleBiometricCancel}
      />

      <VerificationSuccessSheet
        visible={showSuccessSheet}
        message={successMessage}
        autoDismissMs={successAutoDismissMs}
        onComplete={handleSuccessComplete}
      />
    </>
  );

  if (isInline) {
    return (
      <>
        {formContent}
        {sheets}
      </>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {onBack ? (
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}>
            <Text style={styles.backLabel}>← Back</Text>
          </Pressable>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {formContent}
        </ScrollView>
      </KeyboardAvoidingView>

      {sheets}
    </SafeAreaView>
  );
}

export default OtpVerification;
