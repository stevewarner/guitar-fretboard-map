import { Metadata } from 'next';
import { SectionLabel } from '@/components/SectionLabel';
import { PrintWorksheet } from '@/modules/print/PrintWorksheet';

export const metadata: Metadata = {
  title: 'Print template',
  description: 'Blank chord chart and fretboard print templates',
  openGraph: {
    title: 'GuitarTheory | Print template',
    description: 'Blank chord chart and fretboard print templates',
  },
  robots: { index: false, follow: false },
};

const Print = () => {
  return (
    <>
      <div className="flex flex-col items-center">
        <SectionLabel className="printHidden mb-2">
          Printable handout
        </SectionLabel>
        <h1 className="printHidden mb-6 text-3xl font-bold tracking-tight">
          Blank practice worksheet
        </h1>
        <PrintWorksheet />
      </div>
    </>
  );
};

export default Print;
