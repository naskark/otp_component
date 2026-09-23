import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {OtpAutoReadSource} from '../../hooks/useOtpAutoRead';

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  autoRead?: boolean;
  onComplete?: (value: string) => void;
  onAutoRead?: (otp: string, source: OtpAutoReadSource) => void;
  fillHighlight?: boolean;
  attemptPulse?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export interface OTPInputStyles {
  container: ViewStyle;
  cell: ViewStyle;
  cellFocused: ViewStyle;
  cellFilled: ViewStyle;
  cellError: ViewStyle;
  cellDisabled: ViewStyle;
  digit: TextStyle;
  autofillInput: TextStyle;
}
