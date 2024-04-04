import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useWaitForSubgraph } from 'hooks';
import _ from 'lodash';
import { toTreeId } from 'shared';
import { AppHat, HandlePendingTx, SupportedChains } from 'types';
import { fetchHatDetails } from 'utils';
import { useChainId } from 'wagmi';

import useHatContractWrite from './useHatContractWrite';

// workaround for https://github.com/microsoft/TypeScript/issues/48212
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useHatMakeImmutable: any = ({
  selectedHat,
  onchainHats,
  chainId,
  isAdminUser,
  mutable,
  handlePendingTx,
}: UseHatMakeImmutableProps) => {
  const currentNetworkId = useChainId();
  const selectedHatId = selectedHat?.id;

  const waitForSubgraph = useWaitForSubgraph({
    fetchHelper: () => fetchHatDetails(selectedHat.id, chainId),
    checkResult: (hatDetails) => !hatDetails?.mutable,
  });

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'makeHatImmutable',
    args: [hatIdHexToDecimal(selectedHatId)],
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
      Boolean(hatIdHexToDecimal(selectedHatId)) &&
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
