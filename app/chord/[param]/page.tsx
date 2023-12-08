import type { NextPage } from 'next';
import { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { Fretboard, Pattern } from '@/components/FretboardChart';

import ChordData from '../../../chordData.json';

type Props = {
  params: {
    param: string;
  };
};

export async function generateMetadata({
  params: { param },
}: Props): Promise<Metadata> {
  return {
    title: `${param} chord`,
  };
}

const fbHeight = 360 / 2;
const fbWidth = 400 / 2;
const stroke = 4 / 2;

const Chord: NextPage<Props> = ({ params: { param } }) => {
  const data: IChordData = ChordData;

  const formattedParam = param
    .toLowerCase()
    .replace('major7', 'maj7')
    .replace('minor', 'm')
    .replace('min', 'm');

  const { name, tab } = data.openChords[formattedParam] || {};

  if (!name || !tab) return notFound(); // 404 page

  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4">{name}</h1>
        <Fretboard
          numFrets={4}
          showOpenNotes
          small
          options={{
            fbHeight: fbHeight,
            fbWidth: fbWidth,
            strHeight: fbHeight / 5,
            fretWidth: fbWidth / 4,
            stroke: stroke,
            circRad: fbHeight / 20,
            topSpace: fbHeight / 20 + stroke / 2,
          }}
        >
          <Pattern tab={tab} fillColor="#000" />
        </Fretboard>
      </div>
    </>
  );
};

export default Chord;
