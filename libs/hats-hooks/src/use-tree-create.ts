import { useWaitForSubgraph } from 'hooks';
import posthog from 'posthog-js';
import { HandlePendingTx } from 'types';
import { useAccount, useEnsAddress } from 'wagmi';

import { useHatContractWrite } from './use-hat-contract-write';
import { useLastTopHatId } from './use-last-top-hat-id';

const useTreeCreate = ({
  chainId,
  details,
  receiver,
  overrideReceiver,
  imageUrl,
  handlePendingTx,
}: UseTreeCreateProps) => {
  const { address } = useAccount();

  const { data: lastTopHatId } = useLastTopHatId({ chainId });

  const { data: newReceiverResolvedAddress, isLoading: isLoadingNewReceiverResolvedAddress } = useEnsAddress({
    name: receiver,
    chainId: 1,
  });

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  function handleSuccess() {
    if (!lastTopHatId) return;
    posthog.capture('Created New Tree', { chainId, tree_id: lastTopHatId + 1 });
  }

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'mintTopHat',
    args: [overrideReceiver ? (newReceiverResolvedAddress ?? receiver) : address, details || '', imageUrl || ''],
    chainId,
    waitForTxToastData: {
      title: 'Registering your organization with Hats Protocol!',
      description: 'It takes a few seconds for the network to confirm the creation...',
    },
    waitForSubgraphToastData: {
      title: 'Tree created!',
      description: 'Waiting on the subgraph to index your tree...', // 'Successfully created tree',
      duration: 6000, // TODO did we remove this param?
    },
    successToastData: { title: 'Redirecting you to your new tree' },
    queryKeys: [['treeList'], ['wearerDetails']],
    redirect: lastTopHatId ? `/trees/${chainId}/${lastTopHatId + 1}` : null,
    handleSuccess,
    handlePendingTx,
    waitForSubgraph,
  });

  return {
    writeAsync,
    isLoading: isLoading || isLoadingNewReceiverResolvedAddress,
  };
};

interface UseTreeCreateProps {
  chainId: number;
  details?: string;
  receiver: string;
  overrideReceiver: boolean;
  imageUrl?: string;
  handlePendingTx: HandlePendingTx | undefined;
}

export { useTreeCreate };
