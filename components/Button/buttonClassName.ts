import styles from './Button.module.css';

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
  THEME = 'theme',
}

export enum SizeVariant {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

interface Options {
  variant?: ButtonVariant;
  size?: SizeVariant;
  // Fully rounded, pill-shaped corners — the redesigned pages' CTA/action
  // shape. A modifier rather than a new variant since it's orthogonal to
  // color (any variant can be a pill).
  pill?: boolean;
  className?: string;
}

// Single source of truth for the button "look" — shared by Button (a real
// <button>) and ButtonLink (a Next.js <Link> styled the same way), so the
// two can't drift apart into two different visual languages.
export function buttonClassName({
  variant = ButtonVariant.PRIMARY,
  size = SizeVariant.MEDIUM,
  pill = false,
  className = '',
}: Options): string {
  return `${styles.button} ${styles[variant]} ${styles[size]}${pill ? ` ${styles.pill}` : ''}${className ? ` ${className}` : ''}`;
}
