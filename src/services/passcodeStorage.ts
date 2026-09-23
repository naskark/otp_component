import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@otp_app:passcode';

export async function savePasscode(passcode: string): Promise<void> {
  await AsyncStorage.setItem(KEY, passcode);
}

export async function loadPasscode(): Promise<string | null> {
  return AsyncStorage.getItem(KEY);
}
