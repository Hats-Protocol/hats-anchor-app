import { Box } from '@chakra-ui/react';

import { Module } from '@/types';

import MainContent from './MainContent';
import TopMenu from './TopMenu';

const ModuleDrawer = ({
  onCloseModuleDrawer,
  title,
}: {
  onCloseModuleDrawer: () => void;
  title: Module;
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
      <MainContent title={title} />
    </Box>
  );
};

export default ModuleDrawer;
