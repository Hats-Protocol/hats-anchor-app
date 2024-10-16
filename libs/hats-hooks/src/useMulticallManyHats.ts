import { CONFIG } from '@hatsprotocol/constants';
import { HATS_ABI } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { useToast, useWaitForSubgraph } from 'hooks';
import {
  compact,
  filter,
  flatten,
  get,
  includes,
  isEmpty,
  keys,
  map,
  reject,
  size,
  sortBy,
} from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  AppHat,
  FormData,
  HandlePendingTx,
  HatDetails,
  HatsCalls,
  SupportedChains,
} from 'types';
import {
  fetchToken,
  handleDetailsPin,
  invalidateAfterTransaction,
  processHatForCalls,
  summarizeActions,
} from 'utils';
import { Hex, TransactionReceipt } from 'viem';
import { useAccount, useChainId, useWriteContract } from 'wagmi';

import useAdminOfHats from './useAdminOfHats';

const useMulticallManyHats = ({
  isAdminOfAnyHatWithChanges,
  storedData,
  setStoredData,
  treeToDisplay,
  onchainHats,
  chainId,
  handlePendingTx,
  editMode,
  setEditMode,
  onCloseTreeDrawer,
}: UseMulticallManyHatsProps) => {
  const [proposedChanges, setProposedChanges] = useState<AppHat[]>([]);
  const [allCallsData, setAllCallsData] = useState<HatsCalls[]>();
  const [detailsToPin, setDetailsToPin] = useState<HatDetails[]>();
  const { address } = useAccount();
  const currentChain = useChainId();
  const queryClient = useQueryClient();
  const toast = useToast();

  const hatIds = filter(
    map(storedData, 'id'),
    (hatId: string | undefined) => hatId !== undefined,
  ) as Hex[];
  const { adminHatIds } = useAdminOfHats({ hatIds, chainId });

  useEffect(() => {
    const prepareMulticallData = async () => {
      const onlyOnchainHats = filter(treeToDisplay, (hat: AppHat) =>
        includes(map(onchainHats, 'id'), hat.id),
      );

      const removeEmptyHats = filter(storedData, (obj) => {
        const localKeys = keys(obj);
        const withoutId = reject(localKeys, (key) => key === 'id');
        if (isEmpty(withoutId)) return false;
        return true;
      });

      const deployableHatChanges = filter(
        removeEmptyHats,
        (hat: Partial<FormData>) => includes(adminHatIds, hat.id),
      );
      const allCallsPromises = map(
        deployableHatChanges,
        (hat: Partial<FormData>) =>
          processHatForCalls(hat, onlyOnchainHats, chainId),
      );
      const allCalls = await Promise.all(allCallsPromises);
      setAllCallsData(allCalls as HatsCalls[]);

      const localProposedChanges = map(allCalls, 'hatChanges');
      const localDetailsToPin = map(allCalls, 'detailsToPin');
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
  // if (editMode) {
  //   console.log(allCallsData, detailsToPin, isAdminOfAnyHatWithChanges);
  // }

  const { writeContractAsync } = useWriteContract();

  const multicallTx = () => {
    // eslint-disable-next-line no-console
    console.log(allCallsData, detailsToPin, isAdminOfAnyHatWithChanges);
    if (
      isEmpty(allCallsData) ||
      !chainId ||
      chainId !== currentChain ||
      !isAdminOfAnyHatWithChanges
    ) {
      return undefined;
    }

    // ! important that siblings are sent in order
    const sortedCalls = sortBy(allCallsData, 'hatChanges.id');
    // TODO do we need to check if calls is empty?
    const onlyCalls = flatten(
      map(sortedCalls, (localCalls) => {
        return map(get(localCalls, 'calls'), 'callData');
      }),
    ) as Hex[];

    return writeContractAsync({
      address: CONFIG.hatsAddress,
      chainId: Number(chainId),
      abi: HATS_ABI,
      functionName: 'multicall',
      args: [onlyCalls],
    })
      .then((data) => {
        toast.info({
          title: 'Transaction submitted',
          description: 'Waiting for your transaction to be accepted...',
        });

        handlePendingTx?.({
          hash: data as Hex,
          txChainId: chainId,
          txDescription,
          successToastData: {
            title: 'Transaction successful',
            description: txDescription,
            duration: 7000,
          },
          onSuccess,
        });
      })
      .catch((error) => {
        if (
          error.name === 'TransactionExecutionError' &&
          error.message.includes('User rejected the request')
        ) {
          toast.error({
            title: 'Signature rejected!',
            description: 'Please accept the transaction in your wallet',
          });
        } else {
          // eslint-disable-next-line no-console
          console.log(error);
          toast.error({
            title: 'Error occurred!',
            description: 'An error occurred while processing the transaction.',
          });
        }
      });
  };

  const waitForSubgraph = useWaitForSubgraph({ chainId, sendToast: true });

  const onSuccess = async (d: TransactionReceipt | undefined) => {
    await waitForSubgraph(d);
    if (d !== undefined) {
      await invalidateAfterTransaction(Number(chainId), d.transactionHash);
    }
    // TODO alternate error handling needed here?

    queryClient.invalidateQueries({ queryKey: ['treeDetails'] });
    queryClient.invalidateQueries({ queryKey: ['orgChartTree'] });
    queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
    queryClient.invalidateQueries({ queryKey: ['hatDetails'] });

    const newStoredData = filter(
      storedData,
      (hat: Partial<FormData>) => !includes(adminHatIds, hat.id),
    );

    setStoredData?.(newStoredData);
    // todo remove hatId

    setEditMode?.(false);
    onCloseTreeDrawer?.();
  };

  const txDescription = summarizeActions(allCallsData as HatsCalls[]);

  const handleWrite = async () => {
    if (!isEmpty(detailsToPin)) {
      // TODO check to see if any objects are already pinned

      const token = await fetchToken(size(detailsToPin));
      // TODO [low] handle no token/empty string

      const promises = map(
        compact(detailsToPin),
        ({ chainId: cId, hatId, details }: HatPinDetails, index: number) => {
          return setTimeout(() => {
            return handleDetailsPin({ chainId: cId, hatId, details, token });
          }, index * 500);
        },
      );

      await Promise.all(promises);
    }
    const result = await multicallTx?.();
    return result;
  };

  return {
    writeAsync: handleWrite,
    // prepareError,
    // writeError,
    // isLoading,
    proposedChanges,
  };
};

interface UseMulticallManyHatsProps {
  isAdminOfAnyHatWithChanges: boolean;
  storedData: Partial<FormData>[] | undefined;
  setStoredData: Dispatch<SetStateAction<Partial<FormData>[]>> | undefined;
  treeToDisplay: AppHat[] | undefined;
  onchainHats: AppHat[] | undefined;
  chainId: SupportedChains | undefined;
  handlePendingTx: HandlePendingTx | undefined;
  editMode?: boolean;
  setEditMode: Dispatch<SetStateAction<boolean>> | undefined;
  onCloseTreeDrawer: (() => void) | undefined;
}

export interface HatPinDetails {
  chainId: number;
  localChainId?: number;
  hatId: Hex;
  details: HatDetails;
}

export default useMulticallManyHats;
