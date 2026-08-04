import LoadingIcon from '@/svgs/loading.svg';
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

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: SizeVariant;
  isLoading?: boolean;
}

export function Button({
  className,
  variant = ButtonVariant.PRIMARY,
  size = SizeVariant.MEDIUM,
  isLoading = false,
  children,
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]}${className ? ` ${className}` : ''}`}
      aria-disabled={isLoading || undefined}
      aria-busy={isLoading || undefined}
      onClick={(e) => {
        if (isLoading) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...props}
    >
      <span aria-live="polite" className="contents">
        {isLoading ? (
          <LoadingIcon
            aria-label="Loading"
            width={20}
            height={20}
            className="motion-safe:animate-spin"
          />
        ) : (
          children
        )}
      </span>
    </button>
  );
}
