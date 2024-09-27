import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
// import { find } from 'lodash';
import { idToIp } from 'shared';
import { AppHat, HandlePendingTx, SupportedChains } from 'types';

// import { Hex } from 'viem';
// import { useAccount, useChainId } from 'wagmi';
import useHatContractWrite from './useHatContractWrite';
// import useWearerDetails from './useWearerDetails';

const useHatBurn = ({
  selectedHat,
  chainId,
  handlePendingTx,
  waitForSubgraph,
}: {
  selectedHat: AppHat | undefined;
  chainId: SupportedChains | undefined;
  handlePendingTx?: HandlePendingTx;
  waitForSubgraph?: () => Promise<unknown>;
}) => {
  // const currentNetworkId = useChainId();
  // const { address } = useAccount();

  const hatId = selectedHat?.id;

  // const { data: wearer } = useWearerDetails({
  //   wearerAddress: address as Hex,
  //   chainId,
  // });
  // const currentlyWearing = find(wearer, {
  //   id: selectedHat?.id,
  // });
  const txDescription = `Renounced hat ${idToIp(hatId)}`;

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'renounceHat',
    args: [hatId],
    chainId,
    txDescription,
    successToastData: {
      title: 'Hat removed!',
      description: txDescription,
    },
    handlePendingTx,
    waitForSubgraph,
    queryKeys: [
      ['hatDetails', { id: hatId, chainId }],
      ['treeDetails', hatIdToTreeId(BigInt(hatId || '')), chainId || ''],
      ['orgChartTree'],
      ['wearerDetails'],
    ],
    // TODO check where writeAsync is called
    // enabled:
    //   Boolean(hatId) && chainId === currentNetworkId && !!currentlyWearing,
  });

  return { writeAsync, isLoading };
};

export default useHatBurn;
