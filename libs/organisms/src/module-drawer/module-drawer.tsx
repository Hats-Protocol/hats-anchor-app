'use client';

import { hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { find } from 'lodash';
import { useHatsModules } from 'modules-hooks';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { ModuleDetails } from 'types';
import { ScrollArea } from 'ui';

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
    return find(modules, { id: selectedModuleField }) as ModuleDetails;
  }, [modules, selectedModuleField]);

  if (!title) return null;

  return (
    <div className='z-12 fixed right-0 h-full w-full border-l border-gray-200 bg-cyan-50'>
      <TopMenu
        localForm={localForm}
        onCloseModuleDrawer={onCloseModuleDrawer}
        selectedModuleDetails={selectedModuleDetails}
        isStandaloneHatterDeploy={isStandaloneHatterDeploy}
      />

      <ScrollArea className='h-full pt-[75px]'>
        <MainContent localForm={localForm} title={title} isStandaloneHatterDeploy={isStandaloneHatterDeploy} />
      </ScrollArea>
    </div>
  );
};

export { ModuleDrawer };
