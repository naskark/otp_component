import ReactNativeBiometrics from 'react-native-biometrics';

export type BiometricPromptResult = {
  success: boolean;
  sensorAvailable: boolean;
  biometryType?: string;
};

export async function promptBiometricStep(
  promptMessage = 'Confirm to complete verification',
): Promise<BiometricPromptResult> {
  try {
    const rnBiometrics = new ReactNativeBiometrics();
    const sensor = await rnBiometrics.isSensorAvailable();

    if (!sensor.available) {
      return {
        success: false,
        sensorAvailable: false,
        biometryType: sensor.biometryType,
      };
    }

    const {success} = await rnBiometrics.simplePrompt({
      promptMessage,
      cancelButtonText: 'Cancel',
      fallbackPromptMessage: 'Use passcode',
    });

    return {
      success,
      sensorAvailable: true,
      biometryType: sensor.biometryType,
    };
  } catch {
    return {success: false, sensorAvailable: true};
  }
}
