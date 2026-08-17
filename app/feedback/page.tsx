import { Metadata } from 'next';
import { SectionLabel } from '@/components/SectionLabel';
import { Panel } from '@/components/Panel';
import { FeedbackForm } from '@/modules/feedback/FeedbackForm';

export const metadata: Metadata = {
  title: 'Feedback',
  alternates: { canonical: '/feedback' },
};

const Feedback = () => {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 text-center">
      <div>
        <SectionLabel>Correspondence / Feedback</SectionLabel>
        <h1 className="mb-2 mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Send a <span className="text-accent">message.</span>
        </h1>
        <p className="text-sm text-fg-secondary">
          Stuck on a voicing? Spotted a typo? Want a chord added to the library?
          Leave a note below.
        </p>
      </div>
      <Panel className="w-full text-left">
        <FeedbackForm />
      </Panel>
    </div>
  );
};

export default Feedback;
