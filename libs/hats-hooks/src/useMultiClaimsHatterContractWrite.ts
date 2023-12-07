import { getNewInstancesFromReceipt } from '@hatsprotocol/modules-sdk';
import { MULTI_CLAIMS_HATTER_ABI } from 'app-constants';
import _ from 'lodash';
import { useState } from 'react';
import { Hex } from 'viem';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { waitForTransaction } from 'wagmi/actions';

interface ContractInteractionProps {
  functionName: string;
  address?: Hex;
  chainId?: number;
  enabled: boolean;
  args: (string | number | bigint | undefined)[];
}

const useMultiClaimsHatterContractWrite = ({
  functionName,
  chainId,
  enabled,
  address,
  args,
}: ContractInteractionProps) => {
  const [isLoadingMultiClaimsHatter, setIsLoadingMultiClaimsHatter] =
    useState(false);

  // TODO fetch abi from modules sdk

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
      (!_.isEmpty(args) ? !_.some(args, _.isUndefined) : true), // currently we're assuming not
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
