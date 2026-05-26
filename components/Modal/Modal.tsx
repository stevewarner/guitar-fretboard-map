'use client';
import { useEffect, useRef } from 'react';
import CloseIcon from '@/svgs/close.svg';
import styles from './Modal.module.css';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useClickOutside } from '@/hooks/useClickOutside';

interface ModalProps {
  title: string;
  onClose: () => void;
  content?: React.ReactNode;
}

export const Modal = ({ title, onClose, content }: ModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useFocusTrap(modalRef, true);
  useClickOutside(modalRef, onClose);

  return (
    <div className={styles.overlay}>
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>

          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={() => {
              onClose();
            }}
          >
            <CloseIcon height={20} width={20} />
            <span className={styles.srOnly}>Close modal</span>
          </button>
        </div>
        <hr className={styles.divider} />
        {content}
      </div>
    </div>
  );
};
