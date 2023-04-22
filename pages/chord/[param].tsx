import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import { Fretboard, Pattern } from '@/components/FretboardChart';

import ChordData from '../../chordData.json';

type Props = {
  name: string;
  tab: number[] | string[];
};

const Chord: NextPage<Props> = ({ name, tab }) => {
  return (
    <Layout title={`${name} chord`}>
      <div className="flex flex-col items-center">
        <h1 className="mb-4">{name}</h1>
        <Fretboard numFrets={4} showOpenNotes>
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
  // check if param is valid chord
  // const chordRegex = /^([A-G])([a-z]+)(\d*|\+|#)*$/
  // const chordRegex = /^([a-g][#b]?)(maj|min|dim|aug|maj7|min7|7|9|11|13)?$/i;
  // const parsedChord = param.match(chordRegex); // chordRegex.exec(param)

  // const root = parsedChord[1]
  // const quality = parsedChord[2]
  // const extension = parsedChord[3] || ''

  // else return notFound: true

  const data: any | IChordData = ChordData; // Todo fix type here so doesnt need any

  const formattedParam = param
    .toLowerCase()
    .replace('major7', 'maj7')
    .replace('minor', 'm')
    .replace('min', 'm')
    .replace('major', '')
    .replace('maj', '');

  const { name, tab } = data.openChords[formattedParam] || {};

  if (!name || !tab) return { notFound: true }; // 404 page

  return {
    props: {
      // chord: root.toUpperCase() + quality + extension,
      name,
      tab: tab,
    },
  };
};
