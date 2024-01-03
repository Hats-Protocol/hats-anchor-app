import { Box } from '@chakra-ui/react';
import { useHatsModules } from 'hats-hooks';
import { ModuleDetails } from 'hats-types';
import { decimalId } from 'hats-utils';
import _ from 'lodash';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { useTreeForm } from '../../contexts/TreeFormContext';
import MainContent from './MainContent';
import TopMenu from './TopMenu';

const ModuleDrawer = ({
  onCloseModuleDrawer,
  title,
  isStandaloneHatterDeploy,
}: {
  onCloseModuleDrawer: () => void;
  title: string;
  isStandaloneHatterDeploy?: boolean;
}) => {
  const { selectedHat, chainId } = useTreeForm();
  const { modules } = useHatsModules({ chainId });

  const localForm = useForm({
    mode: 'onBlur',
    defaultValues: {
      moduleType: '',
      isPermissionlesslyClaimable: 'No',
      initialClaimableHats: decimalId(selectedHat?.id),
      initialClaimabilityTypes: '2', // 0 for not claimable, 1 for "claimable", 2 for "claimable for"
    },
  });
  const { watch } = localForm;

  const selectedModuleField = watch('moduleType', '');

  const selectedModuleDetails: ModuleDetails | undefined = useMemo(() => {
    return _.find(modules, { id: selectedModuleField }) as ModuleDetails;
  }, [modules, selectedModuleField]);

  return (
    <Box
      w='full'
      h='100%'
      borderLeft='1px solid'
      borderColor='gray.200'
      position='fixed'
      right={0}
      zIndex={12}
      background='cyan.50'
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
        isStandaloneHatterDeploy={isStandaloneHatterDeploy}
      />
    </Box>
  );
};

export default ModuleDrawer;
