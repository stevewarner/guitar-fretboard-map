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
const scrollPos = 0;

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
  scrollPos: scrollPos,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'update scrollPos':
      return {
        ...state,
        scrollPos: action.payload
      }
  }
}

export const FretboardContext = createContext(initialState);
