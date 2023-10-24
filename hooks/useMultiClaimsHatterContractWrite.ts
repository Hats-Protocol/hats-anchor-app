import { getNewInstancesFromReceipt } from '@hatsprotocol/modules-sdk';
import { waitForTransaction } from '@wagmi/core';
import _ from 'lodash';
import { useState } from 'react';
import { Hex } from 'viem';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { MULTI_CLAIMS_HATTER_ABI } from '@/contracts/MultiClaimsHatter';

interface ContractInteractionProps {
  functionName: string;
  address?: Hex;
  enabled: boolean;
  args: (string | number | bigint | undefined)[];
}

const useMultiClaimsHatterContractWrite = ({
  functionName,
  enabled,
  address,
  args,
}: ContractInteractionProps) => {
  const [isLoadingMultiClaimsHatter, setIsLoadingMultiClaimsHatter] =
    useState(false);

  const { chainId } = useTreeForm();

  const { config, error: prepareError } = usePrepareContractWrite({
    address,
    chainId: Number(chainId),
    abi: MULTI_CLAIMS_HATTER_ABI,
    functionName,
    args,
    enabled:
      enabled &&
      !!address &&
      !!chainId &&
      !!functionName &&
      // module creation args could be optional in some cases
      !_.some(args, _.isUndefined), // currently we're assuming not
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
