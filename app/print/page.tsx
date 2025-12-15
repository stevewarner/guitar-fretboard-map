import { Metadata } from 'next';
import { PrintTemplate } from '@/modules/PrintTemplate';

export const metadata: Metadata = {
  title: 'Print template',
  description: 'Guitar chord charts print template',
  openGraph: {
    title: 'GuitarTheory | Print template',
    description: 'Guitar chord charts print template',
  },
};

const Print = () => {
  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="printHidden mb-4">Print template</h1>
        <PrintTemplate />
      </div>
    </>
  );
};

export default Print;
