import {Platform, Vibration} from 'react-native';

export function hapticDigitTap(): void {
  try {
    if (Platform.OS === 'android') {
      Vibration.vibrate(12);
      return;
    }
    Vibration.vibrate(8);
  } catch {
    // Missing VIBRATE permission on older installs — ignore.
  }
}
