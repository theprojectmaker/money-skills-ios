import { Platform } from 'react-native';

export const C = {
  bg: '#0c0d0f',
  surface: '#131518',
  raised: '#1a1d21',
  line: '#24272c',
  lineStrong: '#343840',
  text: '#e8e6e1',
  mute: '#9096a0',
  faint: '#5d636c',
  up: '#38b27f',
  down: '#e2564d',
  amber: '#d9a24a',
  blue: '#7aa2d6',
  ink: '#0c0d0f',
};

export const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'Menlo, Consolas, ui-monospace, monospace' }) as string;

export const money = (x: number, d = 0) =>
  (x < 0 ? '-' : '') + '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
export const rText = (r: number) => (r > 0 ? '+' : r < 0 ? '-' : '') + Math.abs(r).toFixed(2) + 'R';
export const pct = (x: number, d = 0) => (x * 100).toFixed(d) + '%';
export const price = (x: number) => x.toFixed(2);
