import { idToIp } from 'shared';
import { AppHat, HandlePendingTx, SupportedChains } from 'types';
import { TransactionReceipt } from 'viem';

import useHatContractWrite from './useHatContractWrite';

const useHatBurn = ({
  selectedHat,
  chainId,
  handlePendingTx,
  waitForSubgraph,
}: {
  selectedHat: AppHat | undefined;
  chainId: SupportedChains | undefined;
  handlePendingTx: HandlePendingTx | undefined;
  waitForSubgraph?: (data: TransactionReceipt | undefined) => Promise<unknown>;
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
      ['hatDetails'],
      ['treeDetails'],
      ['orgChartTree'],
      ['wearerDetails'],
    ],
  });

  return { writeAsync, isLoading };
};

export default useHatBurn;
