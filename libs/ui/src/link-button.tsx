import Link from 'next/link';
import { ReactNode } from 'react';

import { Button } from './button';
import { cn } from './lib/utils';

// TODO [med] use button variant
export function LinkButton({ href, icon, variant, children }: LinkButtonProps) {
  return (
    <Link href={href}>
      <Button className={cn(variant === 'outlineMatch' ? 'border-sky-600 bg-transparent' : 'bg-sky-600')}>
        <div className={cn('flex gap-3')}>
          {icon}
          <p className={cn('text-sm')}>{children}</p>
        </div>
      </Button>
    </Link>
  );
}

interface LinkButtonProps {
  href: string;
  icon?: ReactNode;
  variant?: string;
  children?: ReactNode;
}
