export const lightColors = {
  background: '#FFFFFF',
  surface: '#F7F7F7',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#CCCCCC',
  borderFocused: '#555555',
  borderError: '#D32F2F',
  button: '#555555',
  buttonDisabled: '#B0B0B0',
  buttonText: '#FFFFFF',
  error: '#D32F2F',
  success: '#2E7D32',
  warning: '#E65100',
  securityBg: '#F5F5F5',
} as const;

export const darkColors = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#F5F5F5',
  textSecondary: '#B0B0B0',
  textMuted: '#808080',
  border: '#555555',
  borderFocused: '#CCCCCC',
  borderError: '#EF5350',
  button: '#E0E0E0',
  buttonDisabled: '#4A4A4A',
  buttonText: '#121212',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFB74D',
  securityBg: '#2A2A2A',
} as const;

export type ThemeColors = typeof lightColors;

export function getColors(scheme: 'light' | 'dark' | null | undefined): ThemeColors {
  return scheme === 'dark' ? darkColors : lightColors;
}
