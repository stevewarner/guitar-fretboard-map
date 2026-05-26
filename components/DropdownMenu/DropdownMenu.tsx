'use client';
import React, { useState, useRef, useEffect, useId } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import styles from './DropdownMenu.module.css';

interface DropdownMenuProps {
  triggerElement: React.ReactNode;
  menuContents: React.ReactNode[];
}

export const DropdownMenu = ({
  triggerElement,
  menuContents,
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerWrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();

  const focusTrigger = () =>
    triggerWrapperRef.current
      ?.querySelector<HTMLElement>('button, [href]')
      ?.focus();

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        focusTrigger();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [isOpen]);

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      setIsOpen(false);
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

    e.preventDefault();
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    if (e.key === 'ArrowDown') {
      (items[currentIndex + 1] ?? items[0])?.focus();
    } else {
      (items[currentIndex - 1] ?? items[items.length - 1])?.focus();
    }
  };

  const trigger = React.isValidElement(triggerElement)
    ? React.cloneElement(
        triggerElement as React.ReactElement<
          React.ButtonHTMLAttributes<HTMLButtonElement>
        >,
        {
          onClick: () => setIsOpen((prev) => !prev),
          'aria-haspopup': 'menu' as const,
          'aria-expanded': isOpen,
          'aria-controls': menuId,
        },
      )
    : triggerElement;

  return (
    <div ref={containerRef} className={styles.container}>
      <div ref={triggerWrapperRef}>{trigger}</div>
      {isOpen && (
        <ul
          ref={menuRef}
          id={menuId}
          role="menu"
          className={styles.menu}
          onKeyDown={handleMenuKeyDown}
        >
          {menuContents.map((item, index) => (
            <li key={index} role="none">
              {React.isValidElement(item)
                ? React.cloneElement(
                    item as React.ReactElement<
                      React.HTMLAttributes<HTMLElement>
                    >,
                    { role: 'menuitem', tabIndex: -1 },
                  )
                : item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
