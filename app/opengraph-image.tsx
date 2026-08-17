import { ImageResponse } from 'next/og';
import Chord from '@/svgs/chord.svg';

export const runtime = 'edge';

// Image metadata
export const alt = 'Guitar Theory';

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        background: '#2563EB',
        color: '#fff',
        width: '100%',
        height: '100%',
        display: 'flex',
        fontSize: '1rem',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Chord width="100vh" height="100vh" />
    </div>,
    {},
  );
}
