export type AppRoute =
  | 'home'
  | 'login'
  | 'payment'
  | 'mpin'
  | 'passcode'
  | 'esignature'
  | 'beneficiary';

export interface FlowCard {
  id: AppRoute;
  icon: string;
  title: string;
  subtitle: string;
}

export const FLOW_CARDS: FlowCard[] = [
  {
    id: 'payment',
    icon: '💳',
    title: 'Payment Verification',
    subtitle: 'Confirm ₹25,000 payment',
  },
  {
    id: 'mpin',
    icon: '👤',
    title: 'Change MPIN',
    subtitle: 'Verify before changing',
  },
  {
    id: 'passcode',
    icon: '🔑',
    title: 'Change Passcode',
    subtitle: '6-digit passcode, then OTP',
  },
  {
    id: 'esignature',
    icon: '✍️',
    title: 'E-Signature',
    subtitle: 'Sign, then verify with OTP',
  },
  {
    id: 'beneficiary',
    icon: '🏦',
    title: 'Add Beneficiary',
    subtitle: 'Verify new beneficiary',
  },
];
