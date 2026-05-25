'use client';
import { useActionState } from 'react';
import { Button, ButtonVariant } from '@/components/Button';
import { submitFeedback } from '@/app/feedbackActions';
import { SentimentInput } from '@/components/SentimentInput';
import { TextArea } from '@/components/TextArea';
import CheckCircleIcon from '@/svgs/check-circle.svg';
import InfoCircleIcon from '@/svgs/info-circle.svg';

const initialState = { success: false, message: '' };

export const FeedbackForm = () => {
  const [formState, formAction, isPending] = useActionState(
    submitFeedback,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-full max-w-lg flex-col gap-6">
      <SentimentInput name="sentiment" label="Feedback" />

      <TextArea
        id="message"
        name="message"
        label="Message"
        rows={4}
        placeholder="Leave a message..."
        maxLength={2000}
        required
      />

      <Button type="submit" isLoading={isPending}>
        Send feedback
      </Button>

      {formState.message && (
        <p
          role="alert"
          className={`flex items-center gap-2 text-sm ${formState.success ? 'text-success' : 'text-error'}`}
        >
          {formState.success ? (
            <CheckCircleIcon aria-hidden="true" height={16} width={16} />
          ) : (
            <InfoCircleIcon aria-hidden="true" height={16} width={16} />
          )}
          {formState.message}
        </p>
      )}
    </form>
  );
};
