import AsyncStorage from '@react-native-async-storage/async-storage';
import type {AppRoute} from '../navigation/types';

const PREFIX = '@otp_app:last_verified:';

export type VerifiableFlow = Exclude<AppRoute, 'home'>;

const FLOWS: VerifiableFlow[] = [
  'login',
  'payment',
  'mpin',
  'passcode',
  'esignature',
  'beneficiary',
];

export async function saveLastVerified(flow: VerifiableFlow): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + flow, String(Date.now()));
  } catch {
    // storage unavailable
  }
}

export async function loadLastVerifiedMap(): Promise<
  Partial<Record<VerifiableFlow, number>>
> {
  const keys = FLOWS.map(f => PREFIX + f);
  const map: Partial<Record<VerifiableFlow, number>> = {};

  try {
    const records = await AsyncStorage.getMany(keys);
    for (const flow of FLOWS) {
      const value = records[PREFIX + flow];
      if (!value) {
        continue;
      }
      const ts = Number(value);
      if (!Number.isNaN(ts)) {
        map[flow] = ts;
      }
    }
  } catch {
    for (const flow of FLOWS) {
      try {
        const value = await AsyncStorage.getItem(PREFIX + flow);
        if (!value) {
          continue;
        }
        const ts = Number(value);
        if (!Number.isNaN(ts)) {
          map[flow] = ts;
        }
      } catch {
        // ignore per-key failures
      }
    }
  }

  return map;
}
