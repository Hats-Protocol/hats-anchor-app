import { Box } from '@chakra-ui/react';
import { HatFormContextProvider, useTreeForm } from 'contexts';
import dynamic from 'next/dynamic';

import BottomMenu from './BottomMenu';
import MainContent from './MainContent';

const Layout = dynamic(() => import('ui').then((mod) => mod.Layout));

const HatDetailsMobile = () => {
  const { selectedHat, editMode } = useTreeForm();

  if (!selectedHat) return null;

  return (
    <Layout hatData={selectedHat}>
      <Box
        w='full'
        h='100%'
        position='fixed'
        background={editMode ? 'cyan.50' : 'whiteAlpha.900'}
        pt={12}
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
