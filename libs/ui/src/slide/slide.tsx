import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { Drawer, DrawerContent, DrawerTitle } from '../drawer';
import { cn } from '../lib/utils';

const Slide = ({
  open,
  onClose,
  overlay = false,
  className,
  children,
  title = 'Slide Panel',
  ...props
}: {
  open: boolean;
  onClose?: () => void;
  overlay?: boolean;
  className?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  title?: string;
}) => {
  return (
    <Drawer
      direction='right'
      open={open}
      onClose={onClose}
      dismissible={false}
      modal={false}
      shouldScaleBackground={false}
      {...props}
    >
      <DrawerContent className={cn('bg-background w-2/3 shadow-lg', className)} hideOverlay={!overlay}>
        <VisuallyHidden asChild>
          <DrawerTitle>{title}</DrawerTitle>
        </VisuallyHidden>
        {children}
      </DrawerContent>
    </Drawer>
  );
};

export { Slide };
