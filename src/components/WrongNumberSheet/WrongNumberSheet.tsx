import React, {useMemo} from 'react';
import {Modal, Pressable, Text, useColorScheme, View} from 'react-native';
import {getColors} from '../../theme';
import {createWrongNumberSheetStyles} from './WrongNumberSheet.styles';

export interface WrongNumberSheetProps {
  visible: boolean;
  destinationLabel: string;
  onClose: () => void;
}

export function WrongNumberSheet({
  visible,
  destinationLabel,
  onClose,
}: WrongNumberSheetProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(() => createWrongNumberSheetStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <Text style={styles.title}>Registered mobile</Text>
          <Text style={styles.body}>
            OTP sent to {destinationLabel}. Mobile updates go through account
            settings or support.
          </Text>
          <Pressable
            style={styles.button}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close">
            <Text style={styles.buttonLabel}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
