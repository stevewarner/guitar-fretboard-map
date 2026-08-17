'use client';
import { useActionState, useId } from 'react';
import { Button } from '@/components/Button';
import { SentimentInput } from '@/components/SentimentInput';
import { TextArea } from '@/components/TextArea';
import CheckCircleIcon from '@/svgs/check-circle.svg';
import InfoCircleIcon from '@/svgs/info-circle.svg';

export interface FeedbackFormState {
  success: boolean;
  message: string;
}

interface SentimentFeedbackFormProps {
  action: (
    prevState: FeedbackFormState,
    formData: FormData,
  ) => Promise<FeedbackFormState>;
  sentimentLabel?: string;
  descriptionLabel?: string;
  descriptionRequired?: boolean;
  descriptionPlaceholder?: string;
  descriptionMaxLength?: number;
  descriptionRows?: number;
  submitLabel?: string;
}

const initialState: FeedbackFormState = { success: false, message: '' };

export const SentimentFeedbackForm = ({
  action,
  sentimentLabel = 'How is it?',
  descriptionLabel = 'Message',
  descriptionRequired = false,
  descriptionPlaceholder = 'Leave a message...',
  descriptionMaxLength = 2000,
  descriptionRows = 4,
  submitLabel = 'Send feedback',
}: SentimentFeedbackFormProps) => {
  const [formState, formAction, isPending] = useActionState(
    action,
    initialState,
  );
  const errorId = useId();

  if (formState.success) {
    return (
      <p
        role="status"
        className="flex items-center gap-2 py-2 text-sm text-success"
      >
        <CheckCircleIcon aria-hidden="true" height={16} width={16} />
        {formState.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex w-full flex-col gap-6">
      <SentimentInput
        name="sentiment"
        label={sentimentLabel}
        required
        aria-describedby={formState.message ? errorId : undefined}
      />

      <TextArea
        name="description"
        label={descriptionLabel}
        rows={descriptionRows}
        placeholder={descriptionPlaceholder}
        maxLength={descriptionMaxLength}
        required={descriptionRequired}
      />

      <Button
        type="submit"
        isLoading={isPending}
        pill
        className="self-start px-6"
      >
        {submitLabel}
      </Button>

      {formState.message && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-2 text-sm text-error"
        >
          <InfoCircleIcon aria-hidden="true" height={16} width={16} />
          {formState.message}
        </p>
      )}
    </form>
  );
};
