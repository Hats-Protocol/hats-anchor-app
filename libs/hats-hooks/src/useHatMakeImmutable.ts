import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { Hat, SupportedChains } from 'hats-types';
import { decimalId } from 'hats-utils';
import _ from 'lodash';
import { toTreeId } from 'shared-utils';
import { useChainId } from 'wagmi';

import useHatContractWrite from './useHatContractWrite';

const useHatMakeImmutable = ({
  selectedHat,
  chainId,
  isAdminUser,
  mutable,
}: UseHatMakeImmutableProps) => {
  const currentNetworkId = useChainId();
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
      _.gt(selectedHat?.levelAtLocalTree, 0) &&
      // TODO hat is onchain
      !!isAdminUser &&
      chainId === currentNetworkId,
  });

  return { writeAsync, isLoading };
};

export default useHatMakeImmutable;

interface UseHatMakeImmutableProps {
  selectedHat: Hat;
  chainId: SupportedChains | undefined;
  isAdminUser?: boolean;
  mutable?: boolean;
}
