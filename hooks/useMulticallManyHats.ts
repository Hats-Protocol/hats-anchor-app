/* eslint-disable no-restricted-syntax */
import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Hex } from 'viem';
import {
  useAccount,
  useChainId,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi';

import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useToast from '@/hooks/useToast';
import { processHatForCalls } from '@/lib/form';
import { handleDetailsPin } from '@/lib/ipfs';
import { Hat, HatDetails } from '@/types';

const useMulticallCallManyHats = () => {
  const [calls, setCalls] = useState<unknown[]>();
  const [proposedChanges, setProposedChanges] = useState<Hat[]>();
  const [detailsToPin, setDetailsToPin] = useState<HatDetails[]>();

  const { address } = useAccount();
  const currentChain = useChainId();
  const {
    chainId,
    treeId,
    storedData,
    onchainHats,
    treeToDisplay,
    setStoredData,
    patchTree,
  } = useTreeForm();

  const toast = useToast();
  const queryClient = useQueryClient();
  const { handlePendingTx } = useOverlay();

  useEffect(() => {
    const prepareMulticallData = async () => {
      const onlyOnchainHats = _.filter(treeToDisplay, (hat) =>
        _.includes(_.map(onchainHats, 'id'), hat.id),
      );

      const allCallsPromises = _.map(storedData, (hat) =>
        processHatForCalls(hat, onlyOnchainHats, chainId),
      );
      const allCalls = await Promise.all(allCallsPromises);

      const localCalls = _.flatten(_.map(allCalls, 'calls'));
      const localProposedChanges = _.map(allCalls, 'hatChanges');
      const localDetailsToPin = _.map(allCalls, 'detailsToPin');
      setCalls(localCalls);
      setProposedChanges(localProposedChanges);
      setDetailsToPin(localDetailsToPin);
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
    abi: CONFIG.hatsAbi,
    functionName: 'multicall',
    args: [_.map(calls, 'callData')],
    enabled: !_.isEmpty(calls) && !!chainId && chainId === currentChain,
  });

  const onSuccess = async () => {
    const treeQueryKey = ['treeDetails', treeId, chainId];
    const orgChartTreeQueryKey = [
      'orgChartTree',
      { chainId, treeId },
      _.map(treeToDisplay, (h) => _.pick(h, ['id', 'details', 'imageUri'])),
    ];

    // * set all queries to undefined to force a refetch, not ideal but working
    queryClient.setQueryData(orgChartTreeQueryKey, undefined);
    queryClient.setQueryData(treeQueryKey, undefined);

    queryClient.invalidateQueries({ queryKey: ['treeDetails'] });
    queryClient.invalidateQueries({ queryKey: ['orgChartTree'] });

    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['treeDetails'] });
      queryClient.invalidateQueries({ queryKey: ['orgChartTree'] });
      queryClient.invalidateQueries({
        queryKey: ['hatDetailsField'],
      });
      queryClient.invalidateQueries({
        queryKey: ['hatDetails'],
      });
      queryClient.invalidateQueries({
        queryKey: ['imageURIs'],
      });
    }, 1000);

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
        fnName: 'Multicall',
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

  const handleWrite = async () => {
    // eslint-disable-next-line no-console
    if (!_.isEmpty(detailsToPin)) {
      console.log('detailsToPin', detailsToPin);
      // ? check to see if any objects are already pinned
      const promises = _.map(
        _.compact(detailsToPin),
        ({ chainId: cId, hatId, details }: HatPinDetails) =>
          handleDetailsPin({ chainId: cId, hatId, details }),
      );

      await Promise.all(promises);
    }
    const result = await writeAsync?.();
    return result;
  };

  return {
    writeAsync: handleWrite,
    prepareError,
    writeError,
    isLoading,
    proposedChanges,
  };
};

export interface HatPinDetails {
  chainId: number;
  localChainId?: number;
  hatId: Hex;
  details: HatDetails;
}

export default useMulticallCallManyHats;
