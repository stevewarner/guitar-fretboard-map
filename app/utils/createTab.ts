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
