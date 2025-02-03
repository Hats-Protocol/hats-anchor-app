import { Drawer, DrawerContent } from '../drawer';
import { cn } from '../lib/utils';

const Slide = ({
  open,
  overlay = false,
  children,
}: {
  open: boolean;
  overlay?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <Drawer direction='right' open={open}>
      <DrawerContent className='w-2/3'>{children}</DrawerContent>
    </Drawer>
  );
};

export { Slide };
