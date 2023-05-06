import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import { Fretboard, Pattern } from '@/components/FretboardChart';

import ChordData from '../../chordData.json';

type Props = {
  name: string;
  tab: number[] | string[];
};

const fbHeight = 360 / 2;
const fbWidth = 400 / 2;
const stroke = 4 / 2;

const Chord: NextPage<Props> = ({ name, tab }) => {
  return (
    <Layout title={`${name} chord`}>
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
    </Layout>
  );
};

export default Chord;

type Context = {
  params: {
    param: string;
  };
};

export const getServerSideProps = async (context: Context) => {
  const { param } = context.params;

  const data: any | IChordData = ChordData; // Todo fix type here so doesnt need any

  const formattedParam = param
    .toLowerCase()
    .replace('major7', 'maj7')
    .replace('minor', 'm')
    .replace('min', 'm');

  const { name, tab } = data.openChords[formattedParam] || {};

  if (!name || !tab) return { notFound: true }; // 404 page

  return {
    props: {
      name,
      tab,
    },
  };
};
