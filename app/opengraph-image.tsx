import { ImageResponse } from 'next/og';
import Chord from '@/svgs/chord.svg';

export const runtime = 'edge';

// Image metadata
export const alt = 'Guitar Theory';

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: '#4F46E5',
          color: '#fff',
          width: '100%',
          height: '100%',
          display: 'flex',
          fontSize: '1rem',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Chord width={196} height={196} />
      </div>
    ),
    {},
  );
}
