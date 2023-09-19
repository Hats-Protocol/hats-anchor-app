import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Module, ModuleDetails } from '@/types';

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
      'Claimable For': 'No',
    },
  });

  const [selectedModuleDetails, setSelectedModuleDetails] = useState<
    ModuleDetails | undefined
  >();

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
        selectedModuleDetails={selectedModuleDetails}
      />
      <MainContent
        localForm={localForm}
        title={title}
        selectedModuleDetails={selectedModuleDetails}
        setSelectedModuleDetails={setSelectedModuleDetails}
      />
    </Box>
  );
};

export default ModuleDrawer;
