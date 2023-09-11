import { Box } from '@chakra-ui/react';

import MainContent from './MainContent';
import TopMenu from './TopMenu';

const ModuleDrawer = ({
  onCloseModuleDrawer,
}: {
  onCloseModuleDrawer: () => void;
}) => {
  return (
    <Box
      w='full'
      h='100%'
      borderLeft='1px solid'
      borderColor='gray.200'
      position='fixed'
      right={0}
      zIndex={12}
    >
      <TopMenu onCloseModuleDrawer={onCloseModuleDrawer} />
      <MainContent />
    </Box>
  );
};

export default ModuleDrawer;
