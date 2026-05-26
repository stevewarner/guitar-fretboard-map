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
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]}${className ? ` ${className}` : ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <LoadingIcon aria-label="Loading" width={20} height={20} />
      ) : (
        children
      )}
    </button>
  );
}
