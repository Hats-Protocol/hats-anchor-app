/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { processHatForCalls } from '@/lib/hats';
import { createHatsClient } from '@/lib/web3';

type useMulticallCallDataProps = {
  isExpanded: boolean;
};

const useMulticallCallData = ({ isExpanded }: useMulticallCallDataProps) => {
  const { chainId, treeId, storedData, onchainHats, orgChartTree } =
    useTreeForm();
  const hatsClient = createHatsClient(chainId);

  const computeMulticallData = async () => {
    if (!chainId || !treeId || !storedData) return undefined;

    const onlyOnchainHats = _.filter(orgChartTree, (hat) =>
      _.includes(_.map(onchainHats, 'id'), hat.id),
    );

    const allCallsPromises = _.map(storedData, (hat) =>
      processHatForCalls(hat, onlyOnchainHats, chainId),
    );
    const allCalls = await Promise.all(allCallsPromises);

    const calls = _.map(
      _.flatten(_.map(allCalls, (item) => item.calls) || []),
      (call) => call.callData,
    );

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
