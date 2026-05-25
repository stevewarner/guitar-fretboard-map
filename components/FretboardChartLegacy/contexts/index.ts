import { createContext } from 'react';
import { DEFAULT_HEIGHT, DEFAULT_FRET_WIDTH, STROKE } from '../constants';

const strHeight = DEFAULT_HEIGHT / 5;
const circRad = DEFAULT_HEIGHT / 20;

export const initialState = {
  showOpenNotes: false,
  fbHeight: DEFAULT_HEIGHT,
  fbWidth: DEFAULT_FRET_WIDTH * 4,
  strHeight,
  fretWidth: DEFAULT_FRET_WIDTH,
  stroke: STROKE,
  circRad,
  topSpace: circRad + STROKE / 2,
};

export const FretboardContext = createContext(initialState);
