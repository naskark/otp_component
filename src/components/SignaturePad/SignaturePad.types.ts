export type SignaturePoint = {x: number; y: number};

export type SignatureStroke = SignaturePoint[];

export interface SignaturePadProps {
  strokes: SignatureStroke[];
  onChange: (strokes: SignatureStroke[]) => void;
  height?: number;
  accessibilityLabel?: string;
  editable?: boolean;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}
