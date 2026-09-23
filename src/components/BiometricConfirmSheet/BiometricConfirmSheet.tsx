import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Modal, Pressable, Text, useColorScheme, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {promptBiometricStep} from '../../services/biometricAuth';
import {getColors} from '../../theme';
import {createBiometricConfirmSheetStyles} from './BiometricConfirmSheet.styles';

export interface BiometricConfirmSheetProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

type SheetPhase = 'prompting' | 'unavailable' | 'cancelled' | 'failed';

export function BiometricConfirmSheet({
  visible,
  onConfirm,
  onCancel,
}: BiometricConfirmSheetProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(
    () => createBiometricConfirmSheetStyles(colors),
    [colors],
  );
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<SheetPhase>('prompting');
  const runIdRef = useRef(0);

  const runPrompt = async () => {
    const runId = ++runIdRef.current;
    setPhase('prompting');
    const result = await promptBiometricStep(
      'Biometric confirmation',
    );
    if (runId !== runIdRef.current) {
      return;
    }
    if (result.success) {
      onConfirm();
      return;
    }
    if (!result.sensorAvailable) {
      setPhase('unavailable');
      return;
    }
    setPhase('cancelled');
  };

  useEffect(() => {
    if (!visible) {
      runIdRef.current += 1;
      setPhase('prompting');
      return;
    }
    void runPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const showOverlay = phase !== 'prompting';

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => onCancel?.()}
      accessibilityViewIsModal
      testID="biometric-confirm-sheet">
      {showOverlay ? (
        <View style={styles.backdrop}>
          <View
            style={[styles.sheet, {paddingBottom: Math.max(insets.bottom, 16) + 8}]}>
            <Text style={styles.title}>
              {phase === 'unavailable'
                ? 'Biometrics not available'
                : 'Biometric confirmation required'}
            </Text>
            <Text style={styles.body}>
              {phase === 'unavailable'
                ? 'No fingerprint or Face ID enrolled on this device.'
                : 'Biometric verification did not complete.'}
            </Text>
            <Pressable
              style={styles.button}
              onPress={() => runPrompt()}
              accessibilityRole="button"
              accessibilityLabel="Try biometrics again">
              <Text style={styles.buttonLabel}>Try again</Text>
            </Pressable>
            {phase === 'unavailable' ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={onConfirm}
                accessibilityRole="button"
                accessibilityLabel="Continue without biometrics">
                <Text style={styles.secondaryLabel}>Skip biometrics</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => onCancel?.()}
                accessibilityRole="button"
                accessibilityLabel="Cancel">
                <Text style={styles.secondaryLabel}>Cancel</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.backdrop} accessibilityLabel="Waiting for biometrics" />
      )}
    </Modal>
  );
}
