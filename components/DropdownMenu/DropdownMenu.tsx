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
  const [focusOnOpen, setFocusOnOpen] = useState<'first' | 'last'>('first');
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
    const items =
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
    if (!items || items.length === 0) return;
    (focusOnOpen === 'last' ? items[items.length - 1] : items[0]).focus();
  }, [isOpen, focusOnOpen]);

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setIsOpen(false);
      focusTrigger();
      return;
    }

    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );

    if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

    e.preventDefault();
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
          onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setFocusOnOpen('first');
              setIsOpen(true);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setFocusOnOpen('last');
              setIsOpen(true);
            }
          },
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
                    {
                      role: 'menuitem',
                      tabIndex: -1,
                      onClick: (e: React.MouseEvent<HTMLElement>) => {
                        (
                          item as React.ReactElement<
                            React.HTMLAttributes<HTMLElement>
                          >
                        ).props.onClick?.(e);
                        setIsOpen(false);
                        focusTrigger();
                      },
                      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
                        const typedItem = item as React.ReactElement<
                          React.HTMLAttributes<HTMLElement>
                        >;
                        const isNativelyActivatable =
                          typedItem.type === 'button' || typedItem.type === 'a';
                        if (
                          !isNativelyActivatable &&
                          (e.key === 'Enter' || e.key === ' ')
                        ) {
                          e.preventDefault();
                          typedItem.props.onClick?.(
                            e as unknown as React.MouseEvent<HTMLElement>,
                          );
                          setIsOpen(false);
                          focusTrigger();
                        }
                      },
                    },
                  )
                : item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
