import { Metadata } from 'next';
import { Fretboard, Pattern } from '@/components/FretboardChart';

const numFrets = 15;
const fbHeight = 360;
const fbWidth = 400;
const stroke = 4;

export const metadata: Metadata = {
  title: '4 note voicing intro',
};

const VoicingIntro = () => {
  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4">4 note voicing intro</h1>
        <p>Major scale 4 note (1,5,7,3) example</p>
        <ul>
          <li>Imaj7</li>
          <li>iimin7</li>
          <li>iiimin7</li>
          <li>IVmaj7</li>
          <li>V7</li>
          <li>vimin7</li>
          <li>viimin7b5</li>
        </ul>
        <Fretboard
          numFrets={numFrets}
          styles="mx-4 md:mx-0 py-8"
          options={{
            fbHeight: fbHeight,
            strHeight: fbHeight / 5,
            fretWidth: fbWidth / 4,
            fbWidth: (fbWidth / 4) * numFrets,
            stroke: stroke,
            circRad: fbHeight / 20,
            topSpace: fbHeight / 20 + stroke / 2,
          }}
        >
          <Pattern
            // I chord
            tab={[0, 2, 2, 2]}
            fillColor="#000"
          />
          <Pattern
            // ii chord
            tab={[2, 4, 3, 3]}
            fillColor="#fff"
          />
          <Pattern
            // iii chord
            tab={[4, 6, 5, 5]}
            fillColor="#000"
          />
          <Pattern
            // IV chord
            tab={[5, 7, 7, 7]}
            fillColor="#fff"
          />
          <Pattern
            // V chord
            tab={[7, 9, 8, 9]}
            fillColor="#000"
          />
          <Pattern
            // vi chord
            tab={[9, 11, 10, 10]}
            fillColor="#fff"
          />
          <Pattern
            // vii m7b5 chord
            tab={[11, 12, 12, 12]}
            fillColor="#000"
          />
          <Pattern
            // I chord (octave)
            tab={[12, 14, 14, 14]}
            fillColor="#fff"
          />
        </Fretboard>
        <p>inversions example using just Imaj7 chord inversions</p>
        <ul>
          <li>1 5 7 3</li>
          <li>3 7 1 5 (1st inversion)</li>
          <li>5 1 3 7 (2nd inversion)</li>
          <li>7 3 5 1 (3rd inversion)</li>
        </ul>

        <Fretboard
          numFrets={numFrets}
          styles="mx-4 md:mx-0 py-8"
          options={{
            fbHeight: fbHeight,
            strHeight: fbHeight / 5,
            fretWidth: fbWidth / 4,
            fbWidth: (fbWidth / 4) * numFrets,
            stroke: stroke,
            circRad: fbHeight / 20,
            topSpace: fbHeight / 20 + stroke / 2,
          }}
        >
          <Pattern
            // root
            tab={[0, 2, 2, 2]}
            fillColor="#000"
          />
          <Pattern
            // 1st inversion
            tab={[4, 6, 3, 5]}
            fillColor="#fff"
          />
          <Pattern
            // 2nd inversion
            tab={[7, 7, 7, 9]}
            fillColor="#000"
          />
          <Pattern
            // 3rd inversion
            tab={[11, 11, 10, 10]}
            fillColor="#fff"
          />
          <Pattern
            // root octave
            tab={[12, 14, 14, 14]}
            fillColor="#000"
          />
        </Fretboard>
      </div>
    </>
  );
};

export default VoicingIntro;
