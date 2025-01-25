import Link from 'next/link';
import { ReactNode } from 'react';
import React from 'react';

import { Button, ButtonProps } from './button';
import { cn } from './lib/utils';

interface LinkButtonProps {
  href?: string;
  icon?: ReactNode;
  variant?: string;
  children?: ReactNode;
}

interface BaseLinkButtonProps extends LinkButtonProps {
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const BaseLinkButton: React.ForwardRefRenderFunction<HTMLAnchorElement, BaseLinkButtonProps> = (
  { onClick, href, variant, icon, children },
  ref,
) => {
  return (
    <Button variant={variant as ButtonProps['variant']} asChild>
      <a href={href} onClick={onClick} ref={ref}>
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
export function LinkButton({ href, icon, variant, children }: LinkButtonProps) {
  if (!href) return null; // TODO handle no href
  return (
    <Link href={href} passHref legacyBehavior>
      <ForwardedLinkButton icon={icon} variant={variant} children={children} />
    </Link>
  );
}
