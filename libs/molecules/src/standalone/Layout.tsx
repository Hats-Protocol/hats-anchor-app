'use client';

import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

import { BottomMenu } from './bottom-menu';

const StandaloneLayout = ({
  children,
  title,
  claimFn,
  disableClaim,
  requireHatter,
  isLoading,
  isEligible,
  showBottomMenu = true,
}: StandaloneLayoutProps) => {
  return (
    <Box h='100%' w='100%' position='relative'>
      <Box
        h={{ base: 'auto', md: '100vh' }}
        w={{ base: 'auto', md: '100vw' }}
        maxW='1200px'
        mx='auto'
      >
        {children}
      </Box>

      {showBottomMenu && (
        <BottomMenu
          claimFn={claimFn!}
          disableClaim={disableClaim!}
          requireHatter={requireHatter!}
          isLoading={isLoading!}
          isEligible={isEligible!}
        />
      )}
    </Box>
  );
};

export default StandaloneLayout;

interface StandaloneLayoutProps {
  title?: string;
  children: ReactNode;
  claimFn?: () => void;
  disableClaim?: boolean;
  requireHatter?: boolean;
  isLoading?: boolean;
  isEligible?: boolean;
  showBottomMenu?: boolean;
}
