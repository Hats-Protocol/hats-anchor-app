/* eslint-disable no-restricted-syntax */
import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useChainId,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi';

import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import abi from '@/contracts/Hats.json';
import useToast from '@/hooks/useToast';
import { processHatForCalls } from '@/lib/hats';
import { IHat } from '@/types';

const useMulticallCallManyHats = () => {
  const [calls, setCalls] = useState<unknown[]>();
  const [proposedChanges, setProposedChanges] = useState<IHat[]>();

  const { address } = useAccount();
  const currentChain = useChainId();
  const {
    chainId,
    treeId,
    storedData,
    onchainHats,
    treeToDisplay,
    setStoredData,
  } = useTreeForm();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { handlePendingTx } = useOverlay();
  const { patchTree } = useTreeForm();

  useEffect(() => {
    const prepareMulticallData = async () => {
      const onlyOnchainHats = _.filter(treeToDisplay, (hat) =>
        _.includes(_.map(onchainHats, 'id'), hat.id),
      );

      const allCallsPromises = _.map(storedData, (hat) =>
        processHatForCalls(hat, onlyOnchainHats, chainId),
      );
      const allCalls = await Promise.all(allCallsPromises);

      const localCalls = _.flatten(_.map(allCalls, 'calls')) as unknown[];
      const localProposedChanges = _.flatten(
        _.map(allCalls, 'proposedChanges'),
      ) as IHat[];
      setCalls(localCalls);
      setProposedChanges(localProposedChanges);
    };

    if (
      !!chainId &&
      chainId === currentChain &&
      !!treeId &&
      !!address &&
      !!storedData
    )
      prepareMulticallData();
  }, [
    chainId,
    currentChain,
    treeId,
    address,
    storedData,
    onchainHats,
    treeToDisplay,
  ]);

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId: Number(chainId),
    abi,
    functionName: 'multicall',
    args: [_.map(calls, 'callData')],
    enabled: !_.isEmpty(calls) && !!chainId,
  });

  const onSuccess = async () => {
    const treeQueryKey = ['treeDetails', treeId, chainId];
    const orgChartTreeQueryKey = [
      'orgChartTree',
      { chainId, treeId },
      _.map(treeToDisplay, (h) => _.pick(h, ['id', 'details', 'imageUri'])),
    ];
    queryClient.setQueryData(orgChartTreeQueryKey, undefined);
    queryClient.invalidateQueries(treeQueryKey);
    queryClient.setQueryData(treeQueryKey, undefined);

    _.forEach(storedData, (hat) => {
      const hatId = _.get(hat, 'id');
      const hatDetailsField = _.get(hat, 'details');

      if (hatId || hatDetailsField) {
        queryClient.invalidateQueries([
          'hatDetailsField',
          _.get(hat, 'details'),
        ]);
        queryClient.invalidateQueries([
          'hatDetails',
          _.pick(hat, ['id', 'chainId', 'details', 'imageUri']),
        ]);
        queryClient.invalidateQueries(['imageUrl', _.get(hat, 'imageUri')]);
      }
    });

    if (proposedChanges) {
      patchTree?.(proposedChanges);
    }
    setStoredData?.([]);
  };

  const {
    writeAsync,
    isLoading,
    error: writeError,
  } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx?.({
        hash: data.hash,
        toastData: {
          title: 'Transaction successful',
          description: 'Hats were successfully updated',
        },
        onSuccess,
      });
    },
    onError: (error) => {
      if (
        error.name === 'TransactionExecutionError' &&
        error.message.includes('User rejected the request')
      ) {
        toast.error({
          title: 'Signature rejected!',
          description: 'Please accept the transaction in your wallet',
        });
      } else {
        toast.error({
          title: 'Error occurred!',
          description: 'An error occurred while processing the transaction.',
        });
      }
    },
  });

  return {
    writeAsync,
    prepareError,
    writeError,
    isLoading,
    proposedChanges,
  };
};

export default useMulticallCallManyHats;
