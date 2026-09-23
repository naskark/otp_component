import {hasSignatureInk} from '../signature';

describe('signature utils', () => {
  it('detects enough ink', () => {
    const strokes = [
      Array.from({length: 15}, (_, i) => ({x: i, y: i})),
    ];
    expect(hasSignatureInk(strokes)).toBe(true);
    expect(hasSignatureInk([[{x: 0, y: 0}]])).toBe(false);
  });
});
