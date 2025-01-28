'use client';

import { DEPLOYMENT_TYPES } from '@hatsprotocol/constants';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import _ from 'lodash';
import { useModuleDeploy, useMultiClaimsHatterCheck } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsBoxArrowRight, BsXSquare } from 'react-icons/bs';
import { ModuleDetails } from 'types';
import { Button, Tooltip } from 'ui';
import { logger } from 'utils';
import { useChainId } from 'wagmi';

const NetworkSwitcher = dynamic(() => import('molecules').then((mod) => mod.NetworkSwitcher));

const TopMenu = ({
  localForm,
  onCloseModuleDrawer,
  selectedModuleDetails,
  isStandaloneHatterDeploy,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  onCloseModuleDrawer: () => void;
  selectedModuleDetails?: ModuleDetails;
  isStandaloneHatterDeploy?: boolean;
}) => {
  const currentNetworkId = useChainId();
  const { chainId, storedData, onchainHats, editMode, setStoredData } = useTreeForm();
  const { selectedHat } = useSelectedHat();

  const { instanceAddress } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    storedData,
    onchainHats,
    editMode,
  });
  const { handlePendingTx } = useOverlay();
  const { watch } = localForm;
  const moduleType = watch('moduleType');
  const isPermissionlesslyClaimable = watch('isPermissionlesslyClaimable');
  const adminHat = watch('adminHat');
  const incrementWearers = watch('incrementWearers');

  const { data: adminHatDetails } = useHatDetails({ hatId: adminHat, chainId });

  const deploymentType = useMemo(() => {
    if (isStandaloneHatterDeploy) {
      return DEPLOYMENT_TYPES.ONLY_CLAIMS_HATTER;
    }
    if (moduleType && !instanceAddress && isPermissionlesslyClaimable === 'Yes') {
      return DEPLOYMENT_TYPES.MODULE_AND_CLAIMS_HATTER;
    }
    return DEPLOYMENT_TYPES.ONLY_MODULE;
  }, [isStandaloneHatterDeploy, moduleType, isPermissionlesslyClaimable, instanceAddress]);

  const {
    deploy,
    isLoading,
    isBlocked: moduleDeployIsBlocked,
  } = useModuleDeploy({
    localForm,
    selectedHat,
    chainId,
    storedData,
    onchainHats,
    setStoredData,
    selectedModuleDetails,
    onCloseModuleDrawer,
    deploymentType,
    handlePendingTx,
  });

  const isChainCorrect = currentNetworkId === chainId;

  const cannotDeployWithoutIncrement = useMemo(() => {
    const storedSupply = _.get(_.find(storedData, ['id', adminHat]), 'maxSupply');
    const supplyExhausted = (storedSupply || adminHatDetails?.currentSupply) === adminHatDetails?.maxSupply;
    return incrementWearers === 'No' && supplyExhausted;
  }, [adminHat, adminHatDetails?.currentSupply, adminHatDetails?.maxSupply, incrementWearers, storedData]);

  const requiresModuleTypeCheck = !(isStandaloneHatterDeploy && isPermissionlesslyClaimable === 'Yes');

  logger.debug({
    formValid: localForm?.formState.isValid,
    isChainCorrect,
    requiresModuleTypeCheck,
    moduleType,
    cannotDeployWithoutIncrement,
    moduleDeployIsBlocked,
  });

  const isButtonDisabled =
    !localForm?.formState.isValid ||
    !isChainCorrect ||
    (requiresModuleTypeCheck && !moduleType) ||
    cannotDeployWithoutIncrement ||
    moduleDeployIsBlocked;

  return (
    <div className='z-16 bg-whiteAlpha-900 absolute top-0 flex h-[75px] w-full items-center justify-between px-4'>
      <Button variant='outline' className='border-gray-300' onClick={onCloseModuleDrawer}>
        <BsXSquare className='mr-2' />
        Cancel
      </Button>

      <div className='flex items-center'>
        {!isChainCorrect && <NetworkSwitcher />}
        <Tooltip label={!isChainCorrect ? 'Please switch to the correct network' : undefined}>
          <Button className='bg-twitter' disabled={isButtonDisabled || isLoading} onClick={() => deploy()}>
            <BsBoxArrowRight className='mr-1' />
            Deploy & Return
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export { TopMenu };
