import NextLink from 'next/link';
import { ReactNode } from 'react';

import { cn } from '../lib/utils';

const Link = ({ href, children, onClick, className, isExternal = false, passHref = false, style }: LinkProps) => (
  <NextLink
    href={href}
    className={cn('text-functional-link-primary hover:text-functional-link-primary/80', className)}
    target={isExternal ? '_blank' : undefined}
    rel={isExternal ? 'noopener noreferrer' : undefined}
    onClick={onClick}
    passHref={passHref}
    style={style}
  >
    {children}
  </NextLink>
);

// Set display name for forwardRef linting
Link.displayName = 'Link';

interface LinkProps {
  href: string;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  isExternal?: boolean;
  passHref?: boolean;
  style?: React.CSSProperties;
}

export { Link, type LinkProps };
