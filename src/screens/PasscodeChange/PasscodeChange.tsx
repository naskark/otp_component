import React, {useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {VerificationButton} from '../../components/VerificationButton';
import {savePasscode} from '../../services/passcodeStorage';
import {getColors} from '../../theme';
import {
  isCompletePasscode,
  passcodesMatch,
  PASSCODE_LENGTH,
  sanitizePasscodeInput,
} from '../../utils/passcode';
import {OtpVerification} from '../OtpVerification';
import {createPasscodeChangeStyles} from './PasscodeChange.styles';

export interface PasscodeChangeScreenProps {
  onComplete?: () => void;
  onBack?: () => void;
}

type Step = 'passcode' | 'otp';

export function PasscodeChangeScreen({
  onComplete,
  onBack,
}: PasscodeChangeScreenProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(() => createPasscodeChangeStyles(colors), [colors]);
  const otpHintColor = colors.textSecondary;

  const [step, setStep] = useState<Step>('passcode');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingPasscode, setPendingPasscode] = useState('');

  const bothComplete =
    isCompletePasscode(newPasscode) && isCompletePasscode(confirmPasscode);
  const matched = passcodesMatch(newPasscode, confirmPasscode);

  const handleContinuePasscode = () => {
    setError(null);
    if (!isCompletePasscode(newPasscode)) {
      setError(`Enter a ${PASSCODE_LENGTH}-digit passcode.`);
      return;
    }
    if (!isCompletePasscode(confirmPasscode)) {
      setError(`Re-enter the ${PASSCODE_LENGTH}-digit passcode.`);
      return;
    }
    if (!passcodesMatch(newPasscode, confirmPasscode)) {
      setError('Passcodes do not match.');
      return;
    }
    setPendingPasscode(newPasscode);
    setStep('otp');
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('passcode');
      return;
    }
    onBack?.();
  };

  if (step === 'otp') {
    return (
      <OtpVerification
        sessionId="PASSCODE-CHANGE-01"
        destinationLabel="+91 ******9012"
        channel="sms"
        verifyLabel="Verify passcode change"
        onBack={handleBack}
        onVerified={() => {
          void savePasscode(pendingPasscode).then(() => {
            onComplete?.();
            onBack?.();
          });
        }}
        contextSlot={
          <Text style={{textAlign: 'center', color: otpHintColor, fontSize: 13}}>
            Confirm with OTP to apply the new passcode.
          </Text>
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}>
          <Text style={styles.backLabel}>← Back</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}>
        <View style={styles.passcodeBlock}>
          <Text style={styles.title} accessibilityRole="header">
            Change passcode
          </Text>
          <Text style={styles.subtitle}>
            New {PASSCODE_LENGTH}-digit passcode, then OTP
            on the next step.
          </Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>New passcode</Text>
            <TextInput
              value={newPasscode}
              onChangeText={text => {
                setNewPasscode(sanitizePasscodeInput(text));
                setError(null);
              }}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={PASSCODE_LENGTH}
              style={[
                styles.input,
                !!error && styles.inputError,
                bothComplete && matched && styles.inputMatch,
              ]}
              accessibilityLabel="New passcode"
              testID="passcode-new-input"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Re-enter new passcode</Text>
            <TextInput
              value={confirmPasscode}
              onChangeText={text => {
                setConfirmPasscode(sanitizePasscodeInput(text));
                setError(null);
              }}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={PASSCODE_LENGTH}
              style={[
                styles.input,
                !!error && styles.inputError,
                bothComplete && matched && styles.inputMatch,
              ]}
              accessibilityLabel="Re-enter new passcode"
              testID="passcode-confirm-input"
            />
          </View>

          {bothComplete && matched && !error ? (
            <Text style={styles.matchHint}>Passcodes match</Text>
          ) : null}

          {!!error && <Text style={styles.error}>{error}</Text>}

          <VerificationButton
            label="Continue"
            onPress={handleContinuePasscode}
            disabled={!bothComplete}
          />

          <View style={styles.securityNotice}>
            <Text style={styles.securityText}>
              OTP runs after both passcode fields match.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default PasscodeChangeScreen;
