import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';

type SmsReceivedPayload = {
  message?: string;
  source?: string;
};

type SmsStartResult = {
  telephony?: boolean;
  consent?: boolean;
};

type InboxMessage = {
  message?: string;
  dateMs?: number;
};

export type SmsAutoReadStatus = {
  supported: boolean;
  moduleLinked: boolean;
  hasPermission: boolean;
  telephonyRegistered?: boolean;
  consentRegistered?: boolean;
};

type SmsUserConsentNative = {
  startListening: () => Promise<SmsStartResult>;
  stopListening: () => void;
  refreshListening: () => Promise<SmsStartResult & {hasPermission?: boolean}>;
  hasReceiveSmsPermission: () => Promise<boolean>;
  getStatus: () => Promise<{
    hasPermission: boolean;
    telephonyRegistered: boolean;
    consentRegistered: boolean;
    listening: boolean;
  }>;
  readLatestInboxMessage: () => Promise<InboxMessage | null>;
  readInboxMessageSince?: (sinceMs: number) => Promise<InboxMessage | null>;
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;
};

const LINKING_ERROR =
  'SmsUserConsent native module is not linked. Rebuild the Android app (npm run android).';

const NativeSmsUserConsent: SmsUserConsentNative | undefined =
  NativeModules.SmsUserConsent;

function getModule(): SmsUserConsentNative {
  if (!NativeSmsUserConsent) {
    throw new Error(LINKING_ERROR);
  }
  return NativeSmsUserConsent;
}

export function isSmsAutoReadSupported(): boolean {
  return Platform.OS === 'android';
}

export function isSmsModuleLinked(): boolean {
  return Platform.OS === 'android' && NativeSmsUserConsent != null;
}

export async function getSmsAutoReadStatus(): Promise<SmsAutoReadStatus> {
  if (Platform.OS !== 'android') {
    return {supported: false, moduleLinked: false, hasPermission: false};
  }
  if (!NativeSmsUserConsent) {
    return {supported: true, moduleLinked: false, hasPermission: false};
  }
  try {
    const status = await NativeSmsUserConsent.getStatus();
    return {
      supported: true,
      moduleLinked: true,
      hasPermission: status.hasPermission,
      telephonyRegistered: status.telephonyRegistered,
      consentRegistered: status.consentRegistered,
    };
  } catch {
    return {supported: true, moduleLinked: true, hasPermission: false};
  }
}

export function waitForAndroidActivityReady(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 450);
  });
}

export async function requestSmsPermissionAutomatic(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  const receive = PermissionsAndroid.PERMISSIONS.RECEIVE_SMS;
  const read = PermissionsAndroid.PERMISSIONS.READ_SMS;

  const hasReceive = await PermissionsAndroid.check(receive);
  const hasRead = await PermissionsAndroid.check(read);

  if (hasReceive && hasRead) {
    return true;
  }

  const toRequest: (typeof receive | typeof read)[] = [];
  if (!hasReceive) {
    toRequest.push(receive);
  }
  if (!hasRead) {
    toRequest.push(read);
  }

  const result = await PermissionsAndroid.requestMultiple(toRequest);
  const receiveOk =
    hasReceive || result[receive] === PermissionsAndroid.RESULTS.GRANTED;
  const readOk = hasRead || result[read] === PermissionsAndroid.RESULTS.GRANTED;

  if (__DEV__) {
    console.log('[SmsAutoRead] permission result', {
      receiveOk,
      readOk,
      result,
    });
  }

  return receiveOk || readOk;
}

export async function startSmsAutoRead(
  onMessage: (message: string) => void,
  onError?: (message: string) => void,
): Promise<() => void> {
  if (Platform.OS !== 'android') {
    return () => undefined;
  }

  if (!NativeSmsUserConsent) {
    if (__DEV__) {
      console.warn('[SmsAutoRead]', LINKING_ERROR);
    }
    return () => undefined;
  }

  const module = getModule();

  const emitter = new NativeEventEmitter(NativeModules.SmsUserConsent);

  const receivedSub = emitter.addListener(
    'SmsUserConsent_SmsReceived',
    (payload: SmsReceivedPayload) => {
      if (__DEV__) {
        console.log(
          '[SmsAutoRead] SMS received via',
          payload?.source,
          payload?.message,
        );
      }
      if (payload?.message) {
        onMessage(payload.message);
      }
    },
  );

  const errorSub = emitter.addListener(
    'SmsUserConsent_SmsError',
    (payload: SmsReceivedPayload) => {
      if (payload?.message) {
        onError?.(payload.message);
      }
    },
  );

  await module.startListening().catch(error => {
    if (__DEV__) {
      console.warn('[SmsAutoRead] start failed', error);
    }
  });

  return () => {
    receivedSub.remove();
    errorSub.remove();
    module.stopListening();
  };
}

export type InboxSmsResult = {
  message: string;
  dateMs: number;
};

function filterInboxBySince(
  message: InboxMessage | null,
  sinceMs: number,
): InboxMessage | null {
  if (!message?.message) {
    return null;
  }
  const dateMs = message.dateMs ?? 0;
  if (sinceMs > 0 && dateMs > 0 && dateMs < sinceMs) {
    return null;
  }
  return message;
}

async function readInboxMessageNative(
  sinceMs: number,
): Promise<InboxMessage | null> {
  const module = getModule();
  if (typeof module.readInboxMessageSince === 'function') {
    return module.readInboxMessageSince(sinceMs);
  }
  if (typeof module.readLatestInboxMessage !== 'function') {
    return null;
  }
  try {
    const latest = await module.readLatestInboxMessage();
    return filterInboxBySince(latest, sinceMs);
  } catch (error) {
    const detail = String(error);
    if (detail.includes('expected argument count: 1')) {
      const bridged = NativeModules.SmsUserConsent as {
        readLatestInboxMessage: (ms: number) => Promise<InboxMessage | null>;
      };
      const latest = await bridged.readLatestInboxMessage(sinceMs);
      return filterInboxBySince(latest, sinceMs);
    }
    throw error;
  }
}

export async function pollLatestInboxSms(
  sinceMs: number,
): Promise<InboxSmsResult | null> {
  if (!isSmsModuleLinked()) {
    return null;
  }
  const latest = await readInboxMessageNative(sinceMs);
  if (!latest?.message) {
    return null;
  }
  return {
    message: latest.message,
    dateMs: latest.dateMs ?? sinceMs,
  };
}

export async function refreshSmsListeningAfterPermission(): Promise<void> {
  if (!isSmsModuleLinked()) {
    return;
  }
  const module = getModule();
  await module.refreshListening();
}
