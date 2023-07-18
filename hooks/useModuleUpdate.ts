import { isAddress } from 'viem';
import { useChainId, useEnsAddress } from 'wagmi';

import { MODULE_TYPES, ZERO_ADDRESS } from '@/constants';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import { decimalId, idToPrettyId, prettyIdToIp, toTreeId } from '@/lib/hats';

const useModuleUpdate = ({
  hatsAddress,
  chainId,
  hatId,
  moduleType,
  newAddress,
}: UseModuleUpdateProps) => {
  const currentNetworkId = useChainId();
  const { data: newResolvedAddress, isLoading: isLoadingNewResolvedAddress } =
    useEnsAddress({
      name: newAddress,
      chainId: 1,
    });

  const functionName =
    moduleType === MODULE_TYPES.eligibility
      ? 'changeHatEligibility'
      : 'changeHatToggle';

  const address = (newResolvedAddress ?? newAddress) || ZERO_ADDRESS;

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName,
    args: [decimalId(hatId), address],
    chainId,
    onSuccessToastData: {
      title: `${moduleType} module updated!`,
      description: `Successfully updated the ${moduleType} module of hat #${prettyIdToIp(
        idToPrettyId(hatId),
      )}`,
    },
    queryKeys: [
      ['hatDetails', hatId],
      ['treeDetails', toTreeId(hatId)],
    ],
    enabled:
      Boolean(hatsAddress) &&
      isAddress(newAddress) &&
      chainId === currentNetworkId,
  });

  return {
    writeAsync,
    isLoading: isLoading || isLoadingNewResolvedAddress,
  };
};

export default useModuleUpdate;

interface UseModuleUpdateProps {
  hatsAddress?: `0x${string}`;
  chainId: number;
  hatId: string;
  moduleType: string;
  newAddress: string;
}
