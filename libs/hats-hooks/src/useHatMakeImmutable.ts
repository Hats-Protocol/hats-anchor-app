import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { AppHat, HandlePendingTx, SupportedChains } from 'hats-types';
import { decimalId } from 'hats-utils';
import { useWaitForSubgraph } from 'hooks';
import _ from 'lodash';
import { toTreeId } from 'shared';
import { fetchHatDetails } from 'utils';
import { useChainId } from 'wagmi';

import useHatContractWrite from './useHatContractWrite';

const useHatMakeImmutable = ({
  selectedHat,
  onchainHats,
  chainId,
  isAdminUser,
  mutable,
  handlePendingTx,
}: UseHatMakeImmutableProps) => {
  const currentNetworkId = useChainId();
  const selectedHatId = selectedHat?.id || 'none';

  const waitForSubgraph = useWaitForSubgraph({
    fetchHelper: () => fetchHatDetails(selectedHat.id, chainId),
    checkResult: (hatDetails) => !hatDetails?.mutable,
  });

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'makeHatImmutable',
    args: [decimalId(selectedHatId)],
    chainId: Number(chainId),
    handlePendingTx,
    waitForSubgraph,
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
      _.includes(_.map(onchainHats, 'id'), selectedHatId) &&
      !!isAdminUser &&
      chainId === currentNetworkId,
  });

  return { writeAsync, isLoading };
};

export default useHatMakeImmutable;

interface UseHatMakeImmutableProps {
  selectedHat: AppHat;
  onchainHats: AppHat[];
  chainId: SupportedChains | undefined;
  isAdminUser?: boolean;
  mutable?: boolean;
  handlePendingTx?: HandlePendingTx | undefined;
}
