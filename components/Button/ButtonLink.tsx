import Link, { type LinkProps } from 'next/link';
import { buttonClassName, ButtonVariant, SizeVariant } from './buttonClassName';

interface ButtonLinkProps
  extends
    LinkProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  variant?: ButtonVariant;
  size?: SizeVariant;
  pill?: boolean;
}

// A link styled identically to Button — same CSS module, same variant/size/
// pill options — for navigation that should look like a button (CTAs).
// Kept as a separate component from Button (rather than one polymorphic
// `as`-prop component) so `href` stays a required, type-checked prop here
// and never leaks onto the real <button>.
export function ButtonLink({
  className,
  variant,
  size,
  pill,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassName({ variant, size, pill, className })}
      {...props}
    >
      {children}
    </Link>
  );
}
