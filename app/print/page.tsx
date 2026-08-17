import { Metadata } from 'next';
import { SectionLabel } from '@/components/SectionLabel';
import { PrintTemplate } from '@/modules/print/PrintTemplate';

export const metadata: Metadata = {
  title: 'Print template',
  description: 'Guitar chord charts print template',
  openGraph: {
    title: 'GuitarTheory | Print template',
    description: 'Guitar chord charts print template',
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
          Blank chord chart worksheet
        </h1>
        <PrintTemplate />
      </div>
    </>
  );
};

export default Print;
