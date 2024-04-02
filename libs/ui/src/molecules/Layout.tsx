import { Box } from '@chakra-ui/react';
import { Modal, useOverlay } from 'contexts';
import { useAttemptAutoConnect, useMediaStyles } from 'hooks';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { AppHat } from 'types';

import CommandPalette from './CommandPalette';
import { StandaloneNavbar } from './standalone';
import TransactionHistory from './TransactionHistory';

const Navbar = dynamic(() => import('./Navbar'));

const Layout = ({ editMode, hatData, hideBackLink, children }: LayoutProps) => {
  const localOverlay = useOverlay();
  const { transactions } = localOverlay;
  const { isMobile } = useMediaStyles();

  useAttemptAutoConnect();

  return (
    <>
      <Box position='relative'>
        <Box
          bgColor={editMode ? 'cyan.100' : 'gray.100'}
          backgroundImage='/bg-topography.svg'
          backgroundRepeat='repeat'
          position='fixed'
          h='100%'
          w='100%'
          zIndex={-1}
        />

        <CommandPalette />
        {isMobile ? (
          <StandaloneNavbar hatData={hatData} showLink={!hideBackLink} />
        ) : (
          <Navbar hatData={hatData} />
        )}
        <Box h='100vh' w='100vw'>
          {children}
        </Box>
      </Box>
      <Modal
        name='transactions'
        title='Transactions'
        size='xl'
        localOverlay={localOverlay}
      >
        <TransactionHistory transactions={transactions} showClear />
      </Modal>
    </>
  );
};

export default Layout;

interface LayoutProps {
  editMode?: boolean;
  hatData?: AppHat;
  hideBackLink?: boolean;
  children: ReactNode;
}
