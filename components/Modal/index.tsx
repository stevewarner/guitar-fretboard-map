'use client';
import { useEffect } from 'react';
import CloseIcon from '@/svgs/close.svg';

interface ModalProps {
  title: string;
  onClose: () => void;
  content?: React.ReactNode;
}

export const Modal = ({ title, onClose, content }: ModalProps) => {
  // close modal on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      onClick={() => {
        // click outside modal to close
        onClose();
      }}
    >
      <div
        className="w-11/12 max-w-3xl rounded bg-white p-6 lg:w-3/5"
        onClick={(e) => {
          // needed for click outside modal to close
          e.stopPropagation();
        }}
      >
        <div className="flex items-baseline justify-between">
          <h2 className="m-0">{title}</h2>

          <button
            className="flex items-center gap-2 border-none p-2"
            onClick={() => {
              onClose();
            }}
          >
            <CloseIcon height={20} width={20} />
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        <hr className="my-8" />
        {content}
      </div>
    </div>
  );
};
