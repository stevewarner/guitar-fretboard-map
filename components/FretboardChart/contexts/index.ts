import { createContext } from 'react';

const numFrets = 4;
const showOpenNotes = true;

const fbHeight = 360;
const fbWidth = 400; // 1000
const strHeight = fbHeight / 5;
const fretWidth = 100; // fbWidth / 10
const stroke = 4;
const circRad = fbHeight / 20;
const topSpace = circRad + stroke / 2;

export const initialState = {
  numFrets: numFrets,
  showOpenNotes: showOpenNotes,
  fbHeight: fbHeight,
  fbWidth: fbWidth,
  strHeight: strHeight,
  fretWidth: fretWidth,
  stroke: stroke,
  circRad: circRad,
  topSpace: topSpace,
};

export const FretboardContext = createContext(initialState);
