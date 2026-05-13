'use client';
import { useActionState } from 'react';
import { submitFeedback } from '@/app/feedbackActions';
import ThumbsUpIcon from '@/svgs/thumbsup.svg';

const SENTIMENTS = [
  {
    value: 'positive',
    label: 'Thumbs up',
    icon: <ThumbsUpIcon height="20" width="20" />,
  },
  {
    value: 'negative',
    label: 'Thumbs down',
    icon: <ThumbsUpIcon className="rotate-180" height="20" width="20" />,
  },
] as const;

const initialState = { success: false, message: '' };

export const FeedbackForm = () => {
  const [formState, formAction, isPending] = useActionState(
    submitFeedback,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-full max-w-lg flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-gray-900">
          Feedback
        </legend>
        <div className="flex gap-3">
          {SENTIMENTS.map(({ value, label, icon }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 px-4 py-2 transition-colors has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-600 has-[:checked]:text-white hover:border-indigo-400"
            >
              <input
                type="radio"
                name="sentiment"
                value={value}
                className="sr-only"
                required
              />
              {icon}
              <span className="sr-only">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="message"
          className="text-sm font-semibold text-gray-900"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Leave a message..."
          maxLength={2000}
          required
          className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 disabled:bg-gray-400"
      >
        {isPending ? 'Sending...' : 'Send feedback'}
      </button>

      {formState.message && (
        <p
          role="alert"
          className={`text-sm ${formState.success ? 'text-green-600' : 'text-red-600'}`}
        >
          {formState.message}
        </p>
      )}
    </form>
  );
};
