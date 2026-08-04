'use client';
import { useEffect, useId, useRef } from 'react';
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
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

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

  // Hide the rest of the page from assistive technology while the modal is
  // open — the overlay visually covers everything, but without this a
  // screen reader's virtual cursor can still reach content underneath it.
  // The modal isn't portaled, so instead of diffing document.body's direct
  // children we walk up from the overlay to <body>, inert-ing siblings at
  // every level of ancestry.
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const hidden: Element[] = [];
    let node: Element | null = overlay;
    while (node && node !== document.body) {
      const parent: Element | null = node.parentElement;
      if (parent) {
        Array.from(parent.children).forEach((sibling) => {
          if (sibling !== node && !sibling.hasAttribute('inert')) {
            sibling.setAttribute('inert', '');
            hidden.push(sibling);
          }
        });
      }
      node = parent;
    }

    return () => {
      hidden.forEach((el) => el.removeAttribute('inert'));
    };
  }, []);

  useFocusTrap(modalRef, true);
  useClickOutside(modalRef, onClose);

  return (
    <div className={styles.overlay} ref={overlayRef}>
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
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
