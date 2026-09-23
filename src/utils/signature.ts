import type {SignatureStroke} from '../components/SignaturePad/SignaturePad.types';

export function countSignaturePoints(strokes: SignatureStroke[]): number {
  return strokes.reduce((sum, stroke) => sum + stroke.length, 0);
}

export function hasSignatureInk(
  strokes: SignatureStroke[],
  minPoints = 12,
): boolean {
  return countSignaturePoints(strokes) >= minPoints;
}
