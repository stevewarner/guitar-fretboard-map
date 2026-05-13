'use server';
import { sql } from '@vercel/postgres';

type Sentiment = 'positive' | 'negative';

export interface FeedbackState {
  success: boolean;
  message: string;
}

export async function submitFeedback(
  _prevState: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const message = formData.get('message') as string;
  const sentiment = formData.get('sentiment') as Sentiment | null;

  if (!sentiment || !['positive', 'negative'].includes(sentiment))
    return { success: false, message: 'Please select a sentiment.' };
  if (!message?.trim()) return { success: false, message: 'Please enter your feedback.' };
  if (message.trim().length > 2000) return { success: false, message: 'Message is too long (max 2000 characters).' };

  try {
    await sql.query(
      'INSERT INTO feedback (message, sentiment) VALUES ($1, $2)',
      [message.trim(), sentiment || null],
    );
    return { success: true, message: 'Thanks for your feedback!' };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error saving feedback:', e);
    return { success: false, message: 'Something went wrong. Please try again.' };
  }
}
