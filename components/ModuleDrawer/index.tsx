import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Module, ModuleCreationArg } from '@/types';

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
      claimable: 'No', // defaulting to 'No' as an example
      // ... other fields would be dynamic based on module type and might need to be initialized elsewhere in the component's lifecycle ...
    },
  });

  const { register, handleSubmit, watch, setValue } = localForm;

  const [selectedModuleArgs, setSelectedModuleArgs] = useState<
    ModuleCreationArg[]
  >([]);

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
        selectedModuleArgs={selectedModuleArgs}
      />
      <MainContent
        localForm={localForm}
        title={title}
        selectedModuleArgs={selectedModuleArgs}
        setSelectedModuleArgs={setSelectedModuleArgs}
      />
    </Box>
  );
};

export default ModuleDrawer;
