/* eslint-disable no-restricted-syntax */
import { CONFIG } from '@hatsprotocol/constants';
import { useQueryClient } from '@tanstack/react-query';
import {
  AppHat,
  FormData,
  HandlePendingTx,
  HatDetails,
  HatsCalls,
  SupportedChains,
} from 'hats-types';
import { useToast } from 'hooks';
import _ from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  fetchToken,
  handleDetailsPin,
  processHatForCalls,
  summarizeActions,
} from 'utils';
import { Hex, TransactionReceipt } from 'viem';
import {
  useAccount,
  useChainId,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi';

import useAdminOfHats from './useAdminOfHats';

const useMulticallManyHats = ({
  isAdminOfAnyHatWithChanges,
  storedData,
  setStoredData,
  treeToDisplay,
  onchainHats,
  chainId,
  handlePendingTx,
  patchTree,
}: {
  isAdminOfAnyHatWithChanges: boolean;
  storedData: Partial<FormData>[];
  setStoredData: Dispatch<SetStateAction<Partial<FormData>[]>>;
  treeToDisplay: AppHat[];
  onchainHats: AppHat[];
  chainId: SupportedChains;
  handlePendingTx?: HandlePendingTx;
  patchTree: (p: AppHat[]) => void;
}) => {
  const [calls, setCalls] = useState<unknown[]>();
  const [proposedChanges, setProposedChanges] = useState<AppHat[]>([]);
  const [allCallsData, setAllCallsData] = useState<HatsCalls[]>();

  const [detailsToPin, setDetailsToPin] = useState<HatDetails[]>();

  const { address } = useAccount();
  const currentChain = useChainId();

  const queryClient = useQueryClient();
  const toast = useToast();

  const hatIds = _.filter(
    _.map(storedData, 'id'),
    (hatId: string | undefined) => hatId !== undefined,
  ) as Hex[];
  const { adminHatIds } = useAdminOfHats({ hatIds, chainId });

  useEffect(() => {
    const prepareMulticallData = async () => {
      const onlyOnchainHats = _.filter(treeToDisplay, (hat: AppHat) =>
        _.includes(_.map(onchainHats, 'id'), hat.id),
      );

      const deployableHatChanges = _.filter(
        storedData,
        (hat: Partial<FormData>) => _.includes(adminHatIds, hat.id),
      );
      const allCallsPromises = _.map(
        deployableHatChanges,
        (hat: Partial<FormData>) =>
          processHatForCalls(hat, onlyOnchainHats, chainId),
      );
      const allCalls = await Promise.all(allCallsPromises);
      setAllCallsData(allCalls as HatsCalls[]);

      const localCalls = _.flatten(_.map(allCalls, 'calls'));
      const localProposedChanges = _.map(allCalls, 'hatChanges');
      const localDetailsToPin = _.map(allCalls, 'detailsToPin');
      setCalls(localCalls);
      setProposedChanges(localProposedChanges);
      setDetailsToPin(localDetailsToPin);
    };

    if (!!chainId && chainId === currentChain && !!address && !!storedData)
      prepareMulticallData();
  }, [
    chainId,
    currentChain,
    address,
    storedData,
    onchainHats,
    treeToDisplay,
    adminHatIds,
  ]);

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONFIG.hatsAddress,
    chainId: Number(chainId),
    abi: CONFIG.hatsAbi,
    functionName: 'multicall',
    args: [_.map(calls, 'callData')],
    enabled:
      !_.isEmpty(calls) &&
      !!chainId &&
      chainId === currentChain &&
      isAdminOfAnyHatWithChanges,
  });

  const onSuccess = async (d: TransactionReceipt | undefined) => {
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

    const newStoredData = _.filter(
      storedData,
      (hat: Partial<FormData>) => !_.includes(adminHatIds, hat.id),
    );

    setStoredData?.(newStoredData);
  };

  const txDescription = summarizeActions(allCallsData as HatsCalls[]);

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
        txChainId: chainId,
        txDescription,
        toastData: {
          title: 'Transaction successful',
          description: txDescription,
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
    if (!_.isEmpty(detailsToPin)) {
      // ? check to see if any objects are already pinned

      const token = await fetchToken(_.size(detailsToPin));
      // TODO [low] handle no token/empty string

      const promises = _.map(
        _.compact(detailsToPin),
        ({ chainId: cId, hatId, details }: HatPinDetails, index: number) => {
          return setTimeout(() => {
            return handleDetailsPin({ chainId: cId, hatId, details, token });
          }, index * 500);
        },
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

export default useMulticallManyHats;
