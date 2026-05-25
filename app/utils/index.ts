import { FlatTabValue } from '@/types';

export const getContrastColor = (hex: string): '#000' | '#fff' => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000' : '#fff';
};

export const createTab = (val: string): FlatTabValue[] => {
  const parts = val.includes(',') ? val.split(',') : val.split('');
  return parts.map((p) => {
    if (p === 'x') return 'x';
    if (p === '') return undefined;
    const n = Number(p);
    return isNaN(n) ? undefined : n;
  });
};

export const createIntervals = (val: string): string[] => val.split(',');

export const getOrdinal = (n: number) => {
  let ord = 'th';

  if (n % 10 == 1 && n % 100 != 11) {
    ord = 'st';
  } else if (n % 10 == 2 && n % 100 != 12) {
    ord = 'nd';
  } else if (n % 10 == 3 && n % 100 != 13) {
    ord = 'rd';
  }

  return ord;
};
