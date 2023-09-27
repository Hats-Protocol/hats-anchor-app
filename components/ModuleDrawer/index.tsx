import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { ModuleDetails, ModuleKind } from '@/types';

import MainContent from './MainContent';
import TopMenu from './TopMenu';

const ModuleDrawer = ({
  updateModuleAddress,
  onCloseModuleDrawer,
  title,
}: {
  updateModuleAddress: (value: string) => void;
  onCloseModuleDrawer: () => void;
  title: ModuleKind;
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
        updateModuleAddress={updateModuleAddress}
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
