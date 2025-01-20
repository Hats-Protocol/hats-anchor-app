'use client';

import { Box } from '@chakra-ui/react';
import { hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import _ from 'lodash';
import { useHatsModules } from 'modules-hooks';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { ModuleDetails } from 'types';

import { MainContent } from './main-content';
import { TopMenu } from './top-menu';

const ModuleDrawer = ({
  onCloseModuleDrawer,
  title,
  isStandaloneHatterDeploy,
}: {
  onCloseModuleDrawer: () => void;
  title?: string;
  isStandaloneHatterDeploy?: boolean;
}) => {
  const { chainId } = useTreeForm();
  const { modules } = useHatsModules({ chainId });
  const { selectedHat } = useSelectedHat();

  const localForm = useForm({
    mode: 'onBlur',
    defaultValues: {
      moduleType: '',
      isPermissionlesslyClaimable: 'Yes',
      initialClaimableHats: selectedHat?.id && hatIdHexToDecimal(selectedHat?.id),
      initialClaimabilityType: '2', // 1 for "claimable", 2 for "claimable for"
    },
  });
  const { watch } = localForm;

  const selectedModuleField = watch('moduleType', '');

  const selectedModuleDetails: ModuleDetails | undefined = useMemo(() => {
    return _.find(modules, { id: selectedModuleField }) as ModuleDetails;
  }, [modules, selectedModuleField]);

  if (!title) return null;

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
      <MainContent localForm={localForm} title={title} isStandaloneHatterDeploy={isStandaloneHatterDeploy} />
    </Box>
  );
};

export { ModuleDrawer };
