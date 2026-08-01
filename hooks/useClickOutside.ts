import { useEffect } from 'react';

export function useClickOutside<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  callback: () => void,
  active: boolean = true,
) {
  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        callback();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [containerRef, callback, active]);
}
