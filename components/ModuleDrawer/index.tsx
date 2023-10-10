import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { decimalId } from '@/lib/hats';
import { ModuleDetails, ModuleKind } from '@/types';

import MainContent from './MainContent';
import TopMenu from './TopMenu';

const ModuleDrawer = ({
  onCloseModuleDrawer,
  title,
  isStandaloneHatterDeploy,
}: {
  onCloseModuleDrawer: () => void;
  title: ModuleKind;
  isStandaloneHatterDeploy?: boolean;
}) => {
  const { selectedHat } = useTreeForm();

  const localForm = useForm({
    mode: 'onBlur',
    defaultValues: {
      moduleType: '',
      isPermissionlesslyClaimable: 'No',
      initialClaimableHats: decimalId(selectedHat?.id),
      initialClaimabilityTypes: 1, // 0 for not claimable, 1 for "claimable", 2 for "claimable for"
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
        isStandaloneHatterDeploy={isStandaloneHatterDeploy}
      />
      <MainContent
        localForm={localForm}
        title={title}
        selectedModuleDetails={selectedModuleDetails}
        setSelectedModuleDetails={setSelectedModuleDetails}
        isStandaloneHatterDeploy={isStandaloneHatterDeploy}
      />
    </Box>
  );
};

export default ModuleDrawer;
