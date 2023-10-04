import { Hex } from 'viem';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';

import { MULTI_CLAIMS_HATTER_ABI } from '@/contracts/MultiClaimsHatter';

import useModuleDetails from './useModuleDetails';

interface ContractInteractionProps {
  functionName: string;
  args: unknown[];
  chainId?: number;
  address?: Hex;
  enabled: boolean;
}

const useMultiClaimsHatterContractWrite = ({
  functionName,
  args,
  chainId,
  enabled,
  address,
}: ContractInteractionProps) => {
  const { data } = useModuleDetails({ address });
  console.log('data', data);
  console.log('args', args);

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

  return {
    writeAsync,
    isLoading,
    prepareError,
    writeError,
  };
};

export default useMultiClaimsHatterContractWrite;
