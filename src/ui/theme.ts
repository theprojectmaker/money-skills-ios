import { Platform } from 'react-native';

// The same dark palette as the charting terminal, so the native screens and the terminal read as one app.
export const C = {
  bg: '#131722',
  surface: '#1e222d',
  raised: '#2a2e39',
  line: '#2a2e39',
  lineStrong: '#434651',
  text: '#d1d4dc',
  mute: '#9598a1',
  faint: '#6a6d78',
  up: '#089981',
  down: '#f23645',
  amber: '#e0b252',
  blue: '#2962ff',
  ink: '#131722',
};

export const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'Menlo, Consolas, ui-monospace, monospace' }) as string;

export const money = (x: number, d = 0) =>
  (x < 0 ? '-' : '') + '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
export const pct = (x: number, d = 0) => (x * 100).toFixed(d) + '%';
