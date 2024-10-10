import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useWaitForSubgraph } from 'hooks';
import { AppHat, HandlePendingTx, SupportedChains } from 'types';

import useHatContractWrite from './useHatContractWrite';

const useHatMakeImmutable = ({
  selectedHat,
  onchainHats,
  chainId,
  isAdminUser,
  mutable,
  handlePendingTx,
}: UseHatMakeImmutableProps) => {
  const selectedHatId = selectedHat?.id;

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'makeHatImmutable',
    args: [hatIdHexToDecimal(selectedHatId || '0x')],
    chainId: Number(chainId),
    handlePendingTx,
    waitForSubgraph,
    successToastData: {
      title: 'Hat Updated!',
      description:
        selectedHatId &&
        `Successfully made hat #${hatIdDecimalToIp(
          BigInt(selectedHatId),
        )} immutable`,
    },
    queryKeys: [['hatDetails'], ['treeDetails']],
  });

  return { writeAsync, isLoading };
};

export default useHatMakeImmutable;

interface UseHatMakeImmutableProps {
  selectedHat: AppHat | undefined;
  onchainHats: AppHat[] | undefined;
  chainId: SupportedChains | undefined;
  isAdminUser?: boolean;
  mutable?: boolean;
  handlePendingTx?: HandlePendingTx | undefined;
}
