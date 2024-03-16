import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { idToIp } from 'shared';
import { AppHat, HandlePendingTx, SupportedChains } from 'types';
import { useAccount, useChainId } from 'wagmi';

import useHatContractWrite from './useHatContractWrite';

const useHatBurn = ({
  selectedHat,
  chainId,
  handlePendingTx,
  waitForSubgraph,
}: {
  selectedHat: AppHat;
  chainId: SupportedChains;
  handlePendingTx?: HandlePendingTx;
  waitForSubgraph?: () => void | undefined;
}) => {
  const currentNetworkId = useChainId();
  const { address } = useAccount();

  const hatId = selectedHat?.id;
  const wearers = selectedHat?.wearers || [];
  const currentlyWearing = _.findKey(wearers, ['id', _.toLower(address)]);
  const txDescription = `Renounced hat ${idToIp(hatId)}`;

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'renounceHat',
    args: [hatId],
    chainId,
    txDescription,
    onSuccessToastData: {
      title: 'Hat removed!',
      description: txDescription,
    },
    handlePendingTx,
    waitForSubgraph,
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
