export const createTab = (val: string): string[] => {
  const splitVal = val.length === 6 ? '' : ',';
  return val.split(splitVal).filter(Boolean);
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
