import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const ConnectWallet = dynamic(() => import('molecules').then((mod) => mod.ConnectWallet));

const StandaloneMobileDrawer = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => (
  <Drawer placement='right' isOpen={isOpen} onClose={onToggle}>
    <DrawerOverlay>
      <DrawerContent>
        <DrawerHeader borderBottomWidth='1px'>
          <Heading variant='medium'>Hats Claims</Heading>
          <DrawerCloseButton onClick={onToggle} />
        </DrawerHeader>
        <DrawerBody>
          <Flex direction='column' justify='end' h='100%' py={6}>
            <ConnectWallet />
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </DrawerOverlay>
  </Drawer>
);

export default StandaloneMobileDrawer;
