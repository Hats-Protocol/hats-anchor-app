'use client';

/* eslint-disable react/jsx-props-no-spreading */
import NextLink from 'next/link';
import { ReactNode } from 'react';

import { cn } from './lib/utils';

const Link = ({ href, children, onClick, className, isExternal = false, passHref = false }: LinkProps) => (
  <NextLink
    href={href}
    className={cn('text-sky-600', className)}
    target={isExternal ? '_blank' : undefined}
    rel={isExternal ? 'noopener noreferrer' : undefined}
    onClick={onClick}
    passHref={passHref}
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
}

export { Link, type LinkProps };
