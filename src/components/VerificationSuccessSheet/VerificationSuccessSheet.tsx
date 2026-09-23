import React, {useEffect, useMemo, useRef} from 'react';
import {Modal, Text, useColorScheme, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getColors} from '../../theme';
import {createVerificationSuccessSheetStyles} from './VerificationSuccessSheet.styles';
import type {VerificationSuccessSheetProps} from './VerificationSuccessSheet.types';

export function VerificationSuccessSheet({
  visible,
  message,
  onComplete,
  autoDismissMs = 3000,
}: VerificationSuccessSheetProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(
    () => createVerificationSuccessSheetStyles(colors),
    [colors],
  );
  const insets = useSafeAreaInsets();
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!visible) {
      completedRef.current = false;
      return;
    }

    const id = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current();
      }
    }, autoDismissMs);

    return () => clearTimeout(id);
  }, [autoDismissMs, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {}}
      accessibilityViewIsModal
      testID="verification-success-sheet">
      <View style={styles.backdrop} accessibilityLabel="Verification successful">
        <View
          style={[styles.sheet, {paddingBottom: spacingBottom(insets.bottom)}]}>
          <View style={styles.handle} accessibilityElementsHidden />
          <View style={styles.iconWrap}>
            <Text style={styles.icon} accessibilityElementsHidden>
              ✓
            </Text>
          </View>
          <Text style={styles.title} accessibilityRole="header">
            Verified successfully
          </Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

function spacingBottom(inset: number): number {
  return Math.max(inset, 16) + 8;
}

export default VerificationSuccessSheet;
