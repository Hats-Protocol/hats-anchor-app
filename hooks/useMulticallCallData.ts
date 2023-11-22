import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { processHatForCalls } from '@/lib/form';
import { handleDetailsPin } from '@/lib/ipfs';
import { createHatsClient } from '@/lib/web3';

import { HatPinDetails } from './useMulticallManyHats';

type useMulticallCallDataProps = {
  isExpanded: boolean;
};

// hats-hooks
const useMulticallCallData = ({ isExpanded }: useMulticallCallDataProps) => {
  const { chainId, treeId, storedData, onchainHats, treeToDisplay } =
    useTreeForm();

  const computeMulticallData = async () => {
    if (!chainId || !treeId || !storedData) return undefined;
    const hatsClient = createHatsClient(chainId);

    const onlyOnchainHats = _.filter(treeToDisplay, (hat) =>
      _.includes(_.map(onchainHats, 'id'), hat.id),
    );

    const allCallsPromises = _.map(storedData, (hat) =>
      processHatForCalls(hat, onlyOnchainHats, chainId),
    );
    const allCalls = await Promise.all(allCallsPromises);

    const calls = _.map(_.flatten(_.map(allCalls, 'calls') || []), 'callData');

    const detailsToPin = _.map(allCalls, 'detailsToPin');
    const detailsPromises = _.map(
      _.compact(detailsToPin),
      (hatDetails: HatPinDetails, index) => {
        setTimeout(() => {
          const {
            chainId: localChainId,
            hatId,
            details,
          } = _.pick(hatDetails, ['chainId', 'hatId', 'details']);
          return handleDetailsPin({ chainId: localChainId, hatId, details });
        }, index * 500); // spread these as to not overload the pinning service
      },
    );
    await Promise.all(detailsPromises);

    return Promise.resolve(hatsClient?.multicallCallData(calls));
  };

  const { data, isLoading } = useQuery({
    queryKey: ['multicallData', { treeId, chainId }, storedData],
    queryFn: computeMulticallData,
    enabled: !!treeId && !!chainId && !!storedData && isExpanded,
  });

  return { data, isLoading };
};

export default useMulticallCallData;
