'use client';
import { Modal } from '@/components/Modal';
import { SentimentFeedbackForm } from '@/components/SentimentFeedbackForm';
import { submitChordFeedback } from '@/app/chord/actions';

interface ChordFeedbackModalProps {
  shapeId: number;
  chordName: string;
  onClose: () => void;
}

export const ChordFeedbackModal = ({
  shapeId,
  chordName,
  onClose,
}: ChordFeedbackModalProps) => {
  const boundAction = submitChordFeedback.bind(null, shapeId);

  return (
    <Modal
      title={`Feedback — ${chordName}`}
      onClose={onClose}
      content={
        <SentimentFeedbackForm
          action={boundAction}
          sentimentLabel="How does it look?"
          descriptionLabel="Notes"
          descriptionPlaceholder="Optional — describe the issue or what's great about it"
          descriptionRows={3}
          submitLabel="Submit"
        />
      }
    />
  );
};
