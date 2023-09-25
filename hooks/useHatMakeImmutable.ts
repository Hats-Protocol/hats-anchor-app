import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { useChainId } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import { decimalId, toTreeId } from '@/lib/hats';

// ! not used w/ edit form

const useHatMakeImmutable = ({
  levelAtLocalTree,
  isAdminUser,
  mutable,
}: UseHatMakeImmutableProps) => {
  const currentNetworkId = useChainId();
  const { chainId, selectedHat } = useTreeForm();
  const selectedHatId = selectedHat?.id || 'none';
  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'makeHatImmutable',
    args: [decimalId(selectedHatId)],
    chainId: Number(chainId),
    onSuccessToastData: {
      title: 'Hat Updated!',
      description:
        selectedHatId &&
        `Successfully made hat #${hatIdDecimalToIp(
          BigInt(selectedHatId),
        )} immutable`,
    },
    queryKeys: [
      ['hatDetails', { id: selectedHatId, chainId }],
      ['treeDetails', toTreeId(selectedHatId)],
    ],
    enabled:
      !!selectedHatId &&
      !!selectedHat?.mutable &&
      Boolean(decimalId(selectedHatId)) &&
      !!mutable &&
      _.gt(levelAtLocalTree, 0) &&
      !!isAdminUser &&
      chainId === currentNetworkId,
  });

  return { writeAsync, isLoading };
};

export default useHatMakeImmutable;

interface UseHatMakeImmutableProps {
  levelAtLocalTree?: number;
  isAdminUser?: boolean;
  mutable?: boolean;
}
