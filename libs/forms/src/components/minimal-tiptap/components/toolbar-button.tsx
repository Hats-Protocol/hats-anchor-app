import type { TooltipProps as RadixTooltipProps } from '@radix-ui/react-tooltip';
import * as React from 'react';
import { Toggle, Tooltip } from 'ui';
import { cn } from 'ui';

type CustomTooltipProps = {
  label: string | undefined;
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
};

interface ToolbarButtonProps extends React.ComponentPropsWithoutRef<typeof Toggle> {
  isActive?: boolean;
  tooltip?: string;
  tooltipOptions?: Omit<CustomTooltipProps, 'label' | 'children'>;
}

export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ isActive, tooltip, tooltipOptions, children, className, ...props }, ref) => {
    const button = (
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

    if (tooltip) {
      return (
        <Tooltip label={tooltip} {...tooltipOptions}>
          {button}
        </Tooltip>
      );
    }

    return button;
  },
);

ToolbarButton.displayName = 'ToolbarButton';

export default ToolbarButton;
