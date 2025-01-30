import Link from 'next/link';
import { ReactNode } from 'react';
import React from 'react';

import { Button, type ButtonProps } from '../button';
import { cn } from '../lib/utils';

interface LinkButtonProps extends ButtonProps {
  href?: string;
  icon?: ReactNode;
  isExternal?: boolean;
  children?: ReactNode;
}

interface BaseLinkButtonProps extends Omit<LinkButtonProps, 'onClick'> {
  onClick?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
}

const BaseLinkButton: React.ForwardRefRenderFunction<HTMLAnchorElement, BaseLinkButtonProps> = (
  { onClick, href, variant, icon, isExternal, children },
  ref,
) => {
  return (
    <Button variant={variant as ButtonProps['variant']} asChild>
      <a
        href={href}
        onClick={onClick}
        ref={ref}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        <div className={cn('flex gap-3')}>
          {icon}
          <p className={cn('text-sm')}>{children}</p>
        </div>
      </a>
    </Button>
  );
};

const ForwardedLinkButton = React.forwardRef(BaseLinkButton);

// TODO [med] use button variant
export function LinkButton({ href, icon, variant = 'default', children, onClick, ...props }: LinkButtonProps) {
  if (!href) return null; // TODO handle no href
  return (
    <Link href={href} passHref legacyBehavior>
      <ForwardedLinkButton icon={icon} variant={variant} onClick={onClick as any} {...props} children={children} />
    </Link>
  );
}
