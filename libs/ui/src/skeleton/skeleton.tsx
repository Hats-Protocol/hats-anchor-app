import * as React from 'react';

import { cn } from '../lib/utils';

/**
 * A skeleton loading placeholder component with a pulsing animation
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('bg-muted/80 animate-pulse rounded-md', className)} {...props} />;
}

export { Skeleton };
