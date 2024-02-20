import { Box } from '@chakra-ui/react';
import { HatFormContextProvider, useTreeForm } from 'contexts';
import dynamic from 'next/dynamic';

import BottomMenu from './BottomMenu';
import MainContent from './MainContent';

const Layout = dynamic(() => import('ui').then((mod) => mod.Layout));

const HatDetailsMobile = () => {
  const { selectedHat } = useTreeForm();

  if (!selectedHat) return null;

  return (
    <Layout hatData={selectedHat}>
      <Box
        w='full'
        h='100%'
        position='fixed'
        background='whiteAlpha.900'
        pt={16}
      >
        <Box w='100%' h='100%' position='relative' zIndex={14}>
          <HatFormContextProvider>
            <MainContent />
            <BottomMenu />
          </HatFormContextProvider>
        </Box>
      </Box>
    </Layout>
  );
};

export default HatDetailsMobile;
