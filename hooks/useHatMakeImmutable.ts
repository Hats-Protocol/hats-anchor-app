import _ from 'lodash';
import { useChainId } from 'wagmi';

import useHatContractWrite from '@/hooks/useHatContractWrite';
import { decimalId, idToPrettyId, prettyIdToIp, toTreeId } from '@/lib/hats';

const useHatMakeImmutable = ({
  hatsAddress,
  chainId,
  hatId,
  levelAtLocalTree,
  isAdminUser,
  mutable,
}: UseHatMakeImmutableProps) => {
  const currentNetworkId = useChainId();
  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'makeHatImmutable',
    args: [decimalId(hatId)],
    chainId: Number(chainId),
    onSuccessToastData: {
      title: 'Hat Updated!',
      description: `Successfully made hat #${prettyIdToIp(
        idToPrettyId(hatId),
      )} immutable`,
    },
    queryKeys: [
      ['hatDetails', hatId],
      ['treeDetails', toTreeId(hatId)],
    ],
    enabled:
      Boolean(hatsAddress) &&
      Boolean(decimalId(hatId)) &&
      _.gt(levelAtLocalTree, 0) &&
      isAdminUser &&
      mutable &&
      chainId === currentNetworkId,
  });

  return { writeAsync, isLoading };
};

export default useHatMakeImmutable;

interface UseHatMakeImmutableProps {
  hatsAddress?: `0x${string}`;
  chainId: number;
  hatId: string;
  levelAtLocalTree: number;
  isAdminUser: boolean;
  mutable: boolean;
}
