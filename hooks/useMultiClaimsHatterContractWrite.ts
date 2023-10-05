import {
  checkAndEncodeArgs,
  getNewInstancesFromReceipt,
} from '@hatsprotocol/modules-sdk';
import { waitForTransaction } from '@wagmi/core';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Hex } from 'viem';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';

import { MODULES_REGISTRY_FACTORY_ADDRESS } from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { MULTI_CLAIMS_HATTER_ABI } from '@/contracts/MultiClaimsHatter';
import { decimalId } from '@/lib/hats';
import { prepareArgs } from '@/lib/modules';
import { ModuleDetails } from '@/types';

interface ContractInteractionProps {
  functionName: string;
  localForm: UseFormReturn;
  selectedModuleDetails?: ModuleDetails;
  address?: Hex;
  enabled: boolean;
}

const useMultiClaimsHatterContractWrite = ({
  functionName,
  localForm,
  selectedModuleDetails,
  enabled,
  address,
}: ContractInteractionProps) => {
  const [isLoadingMultiClaimsHatter, setIsLoadingMultiClaimsHatter] =
    useState(false);

  const { chainId, selectedHat } = useTreeForm();
  const hatId = decimalId(selectedHat?.id);
  const { getValues } = localForm;
  const values = getValues();

  let encodedImmutableArgs: string | undefined;
  let encodedMutableArgs: string | undefined;

  const { immutableArgs, mutableArgs } = prepareArgs(
    values,
    selectedModuleDetails,
  );
  const areArgsFilled = (args: any[]) => args.every((arg) => Boolean(arg));
  const allArgsFilled =
    areArgsFilled(immutableArgs) && areArgsFilled(mutableArgs);

  if (selectedModuleDetails && localForm?.formState.isValid && allArgsFilled) {
    const result = checkAndEncodeArgs({
      module: selectedModuleDetails,
      immutableArgs,
      mutableArgs,
    });
    encodedImmutableArgs = result.encodedImmutableArgs;
    encodedMutableArgs = result.encodedMutableArgs;
  }

  const args = [
    MODULES_REGISTRY_FACTORY_ADDRESS,
    selectedModuleDetails?.implementationAddress,
    hatId,
    encodedImmutableArgs,
    encodedMutableArgs,
    hatId,
    1,
  ];

  const { config, error: prepareError } = usePrepareContractWrite({
    address,
    chainId: Number(chainId),
    abi: MULTI_CLAIMS_HATTER_ABI,
    functionName,
    args,
    enabled: enabled && !!chainId,
  });

  const {
    writeAsync,
    error: writeError,
    isLoading,
  } = useContractWrite({
    ...config,
  });

  const deploy = async () => {
    if (!address) {
      return { newInstances: null };
    }

    setIsLoadingMultiClaimsHatter(true);
    try {
      const result = await writeAsync?.();

      if (!result) {
        setIsLoadingMultiClaimsHatter(false);
        throw new Error('No result');
      }

      const transactionReceipt = await waitForTransaction({
        hash: result?.hash,
      });
      const newInstances = getNewInstancesFromReceipt(transactionReceipt);

      setIsLoadingMultiClaimsHatter(false);
      return {
        newInstances,
      };
    } catch (error) {
      setIsLoadingMultiClaimsHatter(false);
      throw error;
    }
  };

  return {
    writeAsync,
    deploy,
    isLoading: isLoading || isLoadingMultiClaimsHatter,
    prepareError,
    writeError,
  };
};

export default useMultiClaimsHatterContractWrite;
