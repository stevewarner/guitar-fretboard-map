import LoadingIcon from '@/svgs/loading.svg';
import { buttonClassName, ButtonVariant, SizeVariant } from './buttonClassName';

export { ButtonVariant, SizeVariant };

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: SizeVariant;
  isLoading?: boolean;
  pill?: boolean;
}

export function Button({
  className,
  variant,
  size,
  isLoading = false,
  pill,
  children,
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClassName({ variant, size, pill, className })}
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
