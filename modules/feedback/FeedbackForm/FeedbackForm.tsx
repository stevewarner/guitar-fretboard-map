'use client';
import { SentimentFeedbackForm } from '@/components/SentimentFeedbackForm';
import { submitFeedback } from '@/app/feedbackActions';

export const FeedbackForm = () => (
  <SentimentFeedbackForm
    action={submitFeedback}
    sentimentLabel="Feedback"
    descriptionLabel="Message"
    descriptionRequired
    descriptionPlaceholder="Leave a message..."
    descriptionMaxLength={2000}
  />
);
