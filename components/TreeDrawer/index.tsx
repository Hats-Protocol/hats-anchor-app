import { Box } from '@chakra-ui/react';

import BottomMenu from './BottomMenu';
import MainContent from './MainContent';
import TopMenu from './TopMenu';

const TreeDrawer = () => (
  <Box
    w='full'
    h='100%'
    borderLeft='1px solid'
    borderColor='gray.200'
    position='fixed'
    right={0}
    zIndex={12}
  >
    <TopMenu />
    <MainContent />
    <BottomMenu />
  </Box>
);

export default TreeDrawer;
