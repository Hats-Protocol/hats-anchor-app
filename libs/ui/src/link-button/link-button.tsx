import Link from 'next/link';
import { ReactNode } from 'react';
import React from 'react';

import { Button, type ButtonProps } from '../button';
import { cn } from '../lib/utils';

interface LinkButtonProps extends ButtonProps {
  href?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isExternal?: boolean;
  size?: 'default' | 'sm' | 'lg';
  children?: ReactNode;
}

interface BaseLinkButtonProps extends Omit<LinkButtonProps, 'onClick'> {
  onClick?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
}

const BaseLinkButton: React.ForwardRefRenderFunction<HTMLAnchorElement, BaseLinkButtonProps> = (
  { onClick, href, variant, leftIcon, rightIcon, isExternal, size, children, className },
  ref,
) => {
  return (
    <Button variant={variant as ButtonProps['variant']} size={size} className={className} asChild>
      <a
        href={href}
        onClick={onClick}
        ref={ref}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        <div className={cn('flex items-center gap-3')}>
          {leftIcon}
          <p className={cn('text-sm')}>{children}</p>
          {rightIcon}
        </div>
      </a>
    </Button>
  );
};

const ForwardedLinkButton = React.forwardRef(BaseLinkButton);

// TODO [med] use button variant
export function LinkButton({
  href,
  leftIcon,
  rightIcon,
  variant = 'default',
  children,
  onClick,
  ...props
}: LinkButtonProps) {
  if (!href) return null; // TODO handle no href
  return (
    <Link href={href} passHref legacyBehavior>
      <ForwardedLinkButton
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        variant={variant}
        onClick={onClick as any}
        {...props}
        children={children}
      />
    </Link>
  );
}
