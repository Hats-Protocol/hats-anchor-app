import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { useAccount, useChainId } from 'wagmi';

import { useTreeForm } from '../contexts/TreeFormContext';
import useHatContractWrite from './useHatContractWrite';

// hat-hooks
const useHatBurn = () => {
  const currentNetworkId = useChainId();
  const { address } = useAccount();
  const { selectedHat, chainId, hatDisclosure } = useTreeForm();

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
    handleSuccess: () => {
      hatDisclosure?.onClose();
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
