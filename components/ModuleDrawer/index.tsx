import { Box } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

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
  const localForm = useForm({
    mode: 'onBlur',
    defaultValues: {
      moduleType: '',
      claimable: 'No',
    },
  });

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
      <TopMenu
        localForm={localForm}
        onCloseModuleDrawer={onCloseModuleDrawer}
      />
      <MainContent localForm={localForm} title={title} />
    </Box>
  );
};

export default ModuleDrawer;
