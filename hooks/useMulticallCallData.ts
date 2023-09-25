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

const useMulticallCallData = ({ isExpanded }: useMulticallCallDataProps) => {
  const { chainId, treeId, storedData, onchainHats, treeToDisplay } =
    useTreeForm();
  const hatsClient = createHatsClient(chainId);

  const computeMulticallData = async () => {
    if (!chainId || !treeId || !storedData) return undefined;

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
      detailsToPin,
      ({ chainId: localChainId, hatId, details }: HatPinDetails) =>
        handleDetailsPin({ chainId: localChainId, hatId, details }),
    );
    await Promise.all(detailsPromises);

    return Promise.resolve(hatsClient?.multicallCallData(calls));
  };

  const { data, isLoading } = useQuery({
    queryKey: ['multicallData', { treeId, chainId }, storedData],
    queryFn: computeMulticallData,
    enabled:
      !!treeId && !!chainId && !!hatsClient && !!storedData && isExpanded,
  });

  return { data, isLoading };
};

export default useMulticallCallData;
