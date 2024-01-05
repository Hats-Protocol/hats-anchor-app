import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { AppHat, HandlePendingTx, SupportedChains } from 'hats-types';
import _ from 'lodash';
import { useAccount, useChainId } from 'wagmi';

import useHatContractWrite from './useHatContractWrite';

const useHatBurn = ({
  selectedHat,
  chainId,
  handlePendingTx,
  onSuccess,
}: {
  selectedHat: AppHat;
  chainId: SupportedChains;
  handlePendingTx?: HandlePendingTx;
  onSuccess?: () => void | undefined;
}) => {
  const currentNetworkId = useChainId();
  const { address } = useAccount();

  const hatId = selectedHat?.id || 'none';
  const wearers = selectedHat?.wearers || [];
  const currentlyWearing = _.findKey(wearers, ['id', _.toLower(address)]);

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'renounceHat',
    args: [hatId],
    chainId,
    onSuccessToastData: {
      title: 'Hat removed!',
      description: 'Successfully removed hat',
    },
    handlePendingTx,
    handleSuccess: () => {
      onSuccess?.();
    },
    queryKeys: [
      ['hatDetails', { id: hatId, chainId }],
      ['treeDetails', hatIdToTreeId(BigInt(hatId || '')), chainId || ''],
      ['orgChartTree'],
    ],
    enabled:
      Boolean(hatId) && chainId === currentNetworkId && !!currentlyWearing,
  });

  return { writeAsync, isLoading };
};

export default useHatBurn;
