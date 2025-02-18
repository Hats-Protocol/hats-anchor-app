'use client';

import type { TooltipProps as RadixTooltipProps } from '@radix-ui/react-tooltip';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

import { cn } from '../lib/utils';

// TODO extend with placement?

const TooltipProvider = TooltipPrimitive.Provider;

export const TooltipRoot = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> & {
    useTouch?: boolean;
    useTap?: boolean;
  }
>(({ useTouch = false, useTap = false, children, ...props }, _ref) => {
  const [open, setOpen] = React.useState(false);

  const handleTouch = (event: React.TouchEvent | React.MouseEvent) => {
    event.persist();
    setOpen(true);
  };

  return (
    <TooltipPrimitive.Root open={open} onOpenChange={setOpen} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && useTouch) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onTouchStart: handleTouch,
            onMouseDown: handleTouch,
          });
        }
        return child;
      })}
    </TooltipPrimitive.Root>
  );
});
TooltipRoot.displayName = TooltipPrimitive.Root.displayName;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs',
        className,
      )}
      {...props}
    >
      {props.children}
      <TooltipPrimitive.Arrow className='fill-primary' />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

interface TooltipProps extends RadixTooltipProps {
  label: string | undefined;
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const Tooltip = ({ label, children, className, side = 'bottom' }: TooltipProps) => {
  if (!label) return children;

  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className={className} side={side}>
          <p>{label}</p>
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
};

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
