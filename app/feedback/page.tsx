import { Metadata } from 'next';
import { FeedbackForm } from '@/modules/feedback/FeedbackForm';

export const metadata: Metadata = {
  title: 'Feedback',
};

const Feedback = () => {
  return (
    <div className="flex flex-col items-center gap-6">
      <h1>Feedback</h1>
      <p className="text-fg-secondary">Leave a message</p>
      <FeedbackForm />
    </div>
  );
};

export default Feedback;
