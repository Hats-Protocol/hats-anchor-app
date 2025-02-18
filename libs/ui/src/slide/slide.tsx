import { Drawer, DrawerContent } from '../drawer';
import { cn } from '../lib/utils';

const Slide = ({
  open,
  onClose,
  overlay = false, // TODO implement with overlay
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
    <Drawer direction='right' open={open} onClose={onClose} {...props}>
      {/* {overlay && <div className='fixed inset-0 z-10 bg-black/50' />} */}
      <DrawerContent className={cn('w-2/3', className)}>{children}</DrawerContent>
    </Drawer>
  );
};

export { Slide };
