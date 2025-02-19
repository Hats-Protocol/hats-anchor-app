import { Drawer, DrawerContent } from '../drawer';
import { cn } from '../lib/utils';

const Slide = ({
  open,
  onClose,
  overlay = false,
  className,
  children,
  ...props
}: {
  open: boolean;
  onClose?: () => void;
  overlay?: boolean;
  className?: string;
  children: React.ReactNode;
  dismissible?: boolean;
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
        {children}
      </DrawerContent>
    </Drawer>
  );
};

export { Slide };
