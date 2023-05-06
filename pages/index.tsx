import Layout from '@/components/Layout';
import Link from 'next/link';
import { Fretboard, Pattern } from '@/components/FretboardChart';

const numFrets = 13;
const fbHeight = 360;
const fbWidth = 400;
const stroke = 4;

export default function Home() {
  return (
    <Layout>
      <header className="flex flex-row flex-wrap items-center justify-between md:flex-nowrap">
        <div className="min-w-[45%]">
          <h1 className="m-0">Learn the entire guitar fretboard</h1>
        </div>

        <Fretboard
          numFrets={numFrets}
          // showOpenNotes
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
          <path
            d="M 52 380 C 500 380 500 20 1252 20"
            stroke="#FF0000"
            strokeOpacity="0.7"
            strokeWidth="40"
            strokeLinecap="round"
            fill="transparent"
          />
          <Pattern
            // TODO make nested arrays work for scales
            // tab={[
            //   [2, 4],
            //   [1, 2, 4],
            //   [1, 3, 4],
            // ]}
            tab={[0, 2, 2, 1, 0, 12]}
            fillColor="#000"
          />
        </Fretboard>
      </header>
      <section>
        <h2>
          look up a chord in the url like <Link href={'/chord/C'}>Cmajor</Link>
        </h2>
      </section>
    </Layout>
  );
}
