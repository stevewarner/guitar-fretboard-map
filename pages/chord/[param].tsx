import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import { Fretboard, Pattern } from '@/components/FretboardChart';

const getNotes = (chordName: string) => {
  switch (chordName) {
    case 'Cmajor':
      return ['x', 3, 2, 0, 1, 0];
    case 'Dmajor':
      return ['x', 'x', 0, 2, 3, 2];
    case 'Emajor':
      return [0, 2, 2, 1, 0, 0];
    case 'Fmajor':
      return [1, 3, 3, 2, 1, 1];
    case 'Fminor':
      return [1, 3, 3, 1, 1, 1];
    case 'Gmajor':
      return [3, 2, 0, 0, 0, 3];
    case 'Amajor':
      return ['x', 0, 2, 2, 2, 0];
    case 'Bmajor':
      return ['x', 2, 4, 4, 4, 2];
    case 'B7':
      return ['x', 2, 1, 2, 0, 2];
    default:
      return [];
  }
};

type Props = {
  chord: string;
};

const Chord: NextPage<Props> = ({ chord }) => {
  const chordTab = getNotes(chord);

  return (
    <Layout title="Resources">
      <div className="flex flex-col items-center">
        <h1 className="mb-4">{chord}</h1>
        <Fretboard numFrets={4} showOpenNotes>
          <Pattern tab={chordTab.reverse()} fillColor="#000" />
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
  // is valid
  // const chordRegex = /^([A-G])([a-z]+)(\d*|\+|#)*$/
  const chordRegex = /^([a-g][#b]?)(maj|min|dim|aug|maj7|min7|7|9|11|13)?$/i;
  const parsedChord = param.match(chordRegex); // chordRegex.exec(param)

  // console.log(parsedChord);

  // const root = parsedChord[1]
  // const quality = parsedChord[2]
  // const extension = parsedChord[3] || ''

  // else return notFound: true

  return {
    props: {
      // chord: root.toUpperCase() + quality + extension,
      chord: param,
    },
  };
};
