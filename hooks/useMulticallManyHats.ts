/* eslint-disable no-restricted-syntax */
import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import useLocalStorage from '@/hooks/useLocalStorage';
import useToast from '@/hooks/useToast';
import { generateLocalStorageKey } from '@/lib/general';
import { processHatForCalls } from '@/lib/hats';
import { createHatsClient } from '@/lib/web3';
import { IHat } from '@/types';

type useMulticallCallManyHatsProps = {
  chainId?: number;
  treeId?: string;
  onchainHats?: IHat[];
};

const useMulticallCallManyHats = ({
  chainId,
  treeId,
  onchainHats,
}: useMulticallCallManyHatsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const hatsClient = createHatsClient(chainId);
  const toast = useToast();
  const queryClient = useQueryClient();
  const { patchTree } = useTreeForm();

  const localStorageKey = generateLocalStorageKey(chainId, treeId);
  const [storedData, setStoredData] = useLocalStorage<any[]>(
    localStorageKey,
    [],
  );

  const onSubmit = async () => {
    if (!chainId || !treeId || !address || !hatsClient) return undefined;

    const allCallsPromises = _.map(storedData, (hat) =>
      processHatForCalls(hat, onchainHats, chainId, hatsClient),
    );
    const allCalls = await Promise.all(allCallsPromises);

    const calls = _.flatten(_.map(allCalls, 'calls')) as any[];
    const proposedChanges = _.flatten(
      _.map(allCalls, 'proposedChanges'),
    ) as any[];

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
        setStoredData([]);

        toast.success({
          title: 'Transaction successful',
          description: 'Hats were successfully updated',
        });
        return true;
      } catch (error: unknown) {
        console.log(error);
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
