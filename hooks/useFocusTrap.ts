import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function useFocusTrap<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  active: boolean = true
) {
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    previouslyFocusedElementRef.current =
      (document.activeElement as HTMLElement | null) ?? null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter(
        (el) =>
          !el.hasAttribute('disabled') &&
          el.getAttribute('aria-hidden') !== 'true'
      );

      if (focusableElements.length === 0) return;

      const currentIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement
      );

      let nextIndex = currentIndex;

      if (event.shiftKey) {
        nextIndex =
          currentIndex <= 0
            ? focusableElements.length - 1
            : currentIndex - 1;
      } else {
        nextIndex =
          currentIndex === -1 || currentIndex === focusableElements.length - 1
            ? 0
            : currentIndex + 1;
      }

      event.preventDefault();
      focusableElements[nextIndex]?.focus();
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      const previous = previouslyFocusedElementRef.current;
      if (previous && document.contains(previous)) {
        previous.focus();
      }
    };
  }, [containerRef, active]);
}
