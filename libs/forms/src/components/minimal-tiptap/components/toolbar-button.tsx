import * as React from 'react';
import { Toggle } from 'ui';
import { cn } from 'ui';

interface ToolbarButtonProps extends React.ComponentPropsWithoutRef<typeof Toggle> {
  isActive?: boolean;
}

export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ isActive, children, className, ...props }, ref) => {
    return (
      <Toggle
        size='sm'
        ref={ref}
        pressed={isActive}
        className={cn('size-8 p-0', { 'bg-accent': isActive }, className)}
        {...props}
      >
        {children}
      </Toggle>
    );
  },
);

ToolbarButton.displayName = 'ToolbarButton';

export default ToolbarButton;
