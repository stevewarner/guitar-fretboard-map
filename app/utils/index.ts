import { FlatTabValue } from '@/types';

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
