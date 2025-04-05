export const createTab = (val: string) => {
  const newArr: string[] = [];
  val.split('').map((fretNum: string) => {
    !!fretNum && newArr.push(fretNum);
  });
  return newArr;
};
