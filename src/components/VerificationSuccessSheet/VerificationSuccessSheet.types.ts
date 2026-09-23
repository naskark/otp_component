export interface VerificationSuccessSheetProps {
  visible: boolean;
  message: string;
  onComplete: () => void;
  autoDismissMs?: number;
}
