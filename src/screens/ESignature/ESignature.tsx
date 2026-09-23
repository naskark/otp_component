import React, {useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SignaturePad} from '../../components/SignaturePad/SignaturePad';
import type {SignatureStroke} from '../../components/SignaturePad/SignaturePad.types';
import {VerificationButton} from '../../components/VerificationButton';
import {getColors} from '../../theme';
import {hasSignatureInk} from '../../utils/signature';
import {OtpVerification} from '../OtpVerification';
import {createESignatureStyles} from './ESignature.styles';

export interface ESignatureScreenProps {
  onVerified?: () => void;
  onBack?: () => void;
}

export function ESignatureScreen({onVerified, onBack}: ESignatureScreenProps) {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = useMemo(() => createESignatureStyles(colors), [colors]);

  const [strokes, setStrokes] = useState<SignatureStroke[]>([]);
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const hasInk = hasSignatureInk(strokes);

  const handleClear = () => {
    setStrokes([]);
    setShowOtp(false);
    setError(null);
  };

  const handleContinue = () => {
    if (!hasSignatureInk(strokes)) {
      setError('Add a signature before continuing.');
      return;
    }
    setError(null);
    setShowOtp(true);
  };

  const signatureSection = (
    <>
      <Text style={styles.title} accessibilityRole="header">
        E-Signature
      </Text>
      <Text style={styles.subtitle}>
        {showOtp
          ? 'Signature captured. Complete OTP verification below.'
          : 'Sign to authorize this action, then verify with OTP on this screen.'}
      </Text>

      <SignaturePad
        strokes={strokes}
        onChange={setStrokes}
        editable={!showOtp}
        onInteractionStart={() => setIsDrawing(true)}
        onInteractionEnd={() => setIsDrawing(false)}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      {!showOtp ? (
        <View style={styles.actions}>
          <Pressable
            onPress={handleClear}
            style={styles.actionSecondary}
            accessibilityRole="button"
            accessibilityLabel="Clear signature">
            <Text style={styles.actionSecondaryLabel}>Clear</Text>
          </Pressable>
          <View style={styles.actionPrimaryWrap}>
            <VerificationButton
              label="Continue"
              onPress={handleContinue}
              disabled={!hasInk}
            />
          </View>
        </View>
      ) : (
        <Text style={styles.signedHint}>Signature captured</Text>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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

      {!showOtp ? (
        <View style={[styles.flex, styles.signingBody]}>
          <View style={styles.content}>{signatureSection}</View>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            automaticallyAdjustKeyboardInsets
            scrollEnabled={!isDrawing}
            bounces={false}
            overScrollMode="never"
            nestedScrollEnabled={false}
            showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {signatureSection}
              <OtpVerification
                layout="inline"
                sessionId="esign-8842"
                title="OTP Verification"
                destinationLabel="+91 ******9012"
                channel="sms"
                verifyLabel="Verify & sign"
                showWrongNumberLink={false}
                onVerified={onVerified}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

export default ESignatureScreen;
