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
import {getColors} from '../../theme';
import {OtpVerification} from '../OtpVerification';
import {createMpinChangeStyles} from './MpinChange.styles';

export interface MpinChangeScreenProps {
  onComplete?: () => void;
  onBack?: () => void;
}

type Step = 'otp' | 'mpin' | 'done';

function MpinChangeForm({
  step,
  setStep,
  onComplete,
  onBack,
}: {
  step: Step;
  setStep: (step: Step) => void;
  onComplete?: () => void;
  onBack?: () => void;
}) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(() => createMpinChangeStyles(colors), [colors]);

  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sanitize = (value: string) => value.replace(/\D/g, '').slice(0, 4);

  const handleSave = async () => {
    setError(null);
    if (mpin.length !== 4) {
      setError('Enter a 4-digit MPIN.');
      return;
    }
    if (mpin !== confirmMpin) {
      setError('MPINs do not match.');
      return;
    }

    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    setStep('done');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (step === 'done') {
              onComplete?.();
              onBack?.();
              return;
            }
            if (step === 'mpin') {
              setStep('otp');
              return;
            }
            onBack?.();
          }}
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
        <View style={styles.content}>
          {step === 'done' ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>MPIN updated</Text>
              <Text style={styles.successBody}>
                Your MPIN has been changed successfully. Use it for future
                secure actions.
              </Text>
              <VerificationButton
                label="Done"
                onPress={() => {
                  onComplete?.();
                  onBack?.();
                }}
              />
            </View>
          ) : (
            <>
              <Text style={styles.title} accessibilityRole="header">
                Change MPIN
              </Text>
              <Text style={styles.subtitle}>
                Create a new 4-digit MPIN. Avoid easy sequences like 1234.
              </Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>New MPIN</Text>
                <TextInput
                  value={mpin}
                  onChangeText={text => {
                    setMpin(sanitize(text));
                    setError(null);
                  }}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                  style={[styles.input, !!error && styles.inputError]}
                  accessibilityLabel="New MPIN"
                  testID="mpin-new-input"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Confirm MPIN</Text>
                <TextInput
                  value={confirmMpin}
                  onChangeText={text => {
                    setConfirmMpin(sanitize(text));
                    setError(null);
                  }}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                  style={[styles.input, !!error && styles.inputError]}
                  accessibilityLabel="Confirm MPIN"
                  testID="mpin-confirm-input"
                />
              </View>

              {!!error && <Text style={styles.error}>{error}</Text>}

              <VerificationButton
                label="Save MPIN"
                onPress={handleSave}
                disabled={mpin.length !== 4 || confirmMpin.length !== 4}
                loading={saving}
              />

              <View style={styles.securityNotice}>
                <Text style={styles.securityText}>
                  MPIN change follows OTP verification.
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function MpinChangeScreen({onComplete, onBack}: MpinChangeScreenProps) {
  const scheme = useColorScheme();
  const otpHintColor = getColors(scheme).textSecondary;
  const [step, setStep] = useState<Step>('otp');

  if (step === 'otp') {
    return (
      <OtpVerification
        sessionId="MPIN-CHANGE-01"
        destinationLabel="+91 ******9012"
        channel="sms"
        verifyLabel="Verify"
        onBack={onBack}
        onVerified={() => {
          setStep('mpin');
        }}
        contextSlot={
          <Text
            style={{
              textAlign: 'center',
              color: otpHintColor,
              fontSize: 13,
            }}>
            OTP required before MPIN change.
          </Text>
        }
      />
    );
  }

  return (
    <MpinChangeForm
      step={step}
      setStep={setStep}
      onComplete={onComplete}
      onBack={onBack}
    />
  );
}

export default MpinChangeScreen;
