import { Box } from '@chakra-ui/react';
import { useAttemptAutoConnect } from 'hooks';
import { ReactNode } from 'react';

import Navbar from './Navbar';

const StandaloneLayout = ({ children, title }: StandaloneLayoutProps) => {
  useAttemptAutoConnect();

  return (
    <Box h='100%' w='100%' position='relative'>
      <Box
        bgColor='gray.100'
        backgroundImage='/bg-topography.svg'
        backgroundRepeat='repeat'
        position='fixed'
        h='100%'
        w='110%'
        left='-5%'
        zIndex={-1}
      />

      <Navbar showLink={false} />
      <Box
        h={{ base: 'auto', md: '100vh' }}
        w={{ base: 'auto', md: '100vw' }}
        maxW='1200px'
        mx='auto'
      >
        {children}
      </Box>
    </Box>
  );
};

export default StandaloneLayout;

interface StandaloneLayoutProps {
  title?: string;
  children: ReactNode;
}
