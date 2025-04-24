import Link from 'next/link';
import { ReactNode } from 'react';
import React from 'react';

import { Button, type ButtonProps } from '../button';
import { cn } from '../lib/utils';

interface LinkButtonProps extends Omit<ButtonProps, 'asChild'> {
  href?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isExternal?: boolean;
  size?: 'default' | 'sm' | 'lg';
  children?: ReactNode;
  textClassName?: string;
}

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    { href, leftIcon, rightIcon, variant = 'default', children, isExternal, className, textClassName, ...props },
    ref,
  ) => {
    const content = (
      <div className={cn('flex items-center gap-2')}>
        {leftIcon}
        <p className={cn('text-base', textClassName)}>{children}</p>
        {rightIcon}
      </div>
    );

    if (!href) {
      return (
        <Button variant={variant} className={className} {...props}>
          {content}
        </Button>
      );
    }

    if (isExternal) {
      return (
        <Button variant={variant} className={className} asChild {...props}>
          <a href={href} ref={ref} target='_blank' rel='noopener noreferrer'>
            {content}
          </a>
        </Button>
      );
    }

    return (
      <Button variant={variant} className={className} asChild {...props}>
        <Link href={href} ref={ref}>
          {content}
        </Link>
      </Button>
    );
  },
);

LinkButton.displayName = 'LinkButton';

export { LinkButton, type LinkButtonProps };
