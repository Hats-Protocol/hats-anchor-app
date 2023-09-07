/* eslint-disable no-restricted-syntax */
import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import useToast from '@/hooks/useToast';
import { processHatForCalls } from '@/lib/hats';
import { chainsMap, createHatsClient } from '@/lib/web3';

const useMulticallCallManyHats = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const currentChain = useChainId();
  const {
    chainId,
    treeId,
    storedData,
    onchainHats,
    orgChartTree,
    setStoredData,
  } = useTreeForm();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { patchTree } = useTreeForm();

  const hatsClient = createHatsClient(chainId);

  const onSubmit = async () => {
    if (!chainId || !treeId || !address || !hatsClient || !storedData)
      return undefined;

    if (currentChain !== chainId) {
      toast.error({
        title: 'Wrong Chain',
        description: `Please change to ${chainsMap(chainId)?.name}`,
      });
      return undefined;
    }

    const onlyOnchainHats = _.filter(orgChartTree, (hat) =>
      _.includes(_.map(onchainHats, 'id'), hat.id),
    );

    const allCallsPromises = _.map(storedData, (hat) =>
      processHatForCalls(hat, onlyOnchainHats, chainId, hatsClient),
    );
    const allCalls = await Promise.all(allCallsPromises);

    const calls = _.flatten(_.map(allCalls, 'calls')) as any[];
    const proposedChanges = _.flatten(
      _.map(allCalls, 'proposedChanges'),
    ) as any[];

    console.log(proposedChanges);

    if (calls.length > 0) {
      setIsLoading(true);
      try {
        await hatsClient.multicall({
          account: address as Hex,
          calls,
        });

        // TODO handle optimistic image update
        const treeQueryKey = ['treeDetails', treeId, chainId];
        const orgChartTreeQueryKey = [
          'orgChartTree',
          { chainId, treeId },
          _.map(onchainHats, 'id'),
        ];
        queryClient.invalidateQueries(orgChartTreeQueryKey);
        queryClient.invalidateQueries(treeQueryKey);

        _.forEach(storedData, (hat) => {
          const hatId = _.get(hat, 'id');
          const hatDetailsField = _.get(hat, 'details');

          if (hatId && hatDetailsField) {
            queryClient.invalidateQueries(['hatDetailsField', hatDetailsField]);
            queryClient.invalidateQueries(['hatDetails', hatId, chainId]);
          }
        });

        setIsLoading(false);
        patchTree?.(proposedChanges);
        setStoredData?.([]);

        toast.success({
          title: 'Transaction successful',
          description: 'Hats were successfully updated',
        });
        return true;
      } catch (error: unknown) {
        console.log(error);
        // catch signature rejection error

        toast.error({
          title: 'Error occurred!',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });

        setIsLoading(false);
        return false;
      }
    }
    return false;
  };

  return { onSubmit, isLoading };
};

export default useMulticallCallManyHats;
