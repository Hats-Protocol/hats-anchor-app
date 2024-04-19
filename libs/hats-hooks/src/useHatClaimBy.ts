import { CONFIG } from '@hatsprotocol/constants';
import { Module } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useToast, useWaitForSubgraph } from 'hooks';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { AppHat, HandlePendingTx, SupportedChains } from 'types';
import { createHatsModulesClient, fetchHatDetails } from 'utils';
import { Hex } from 'viem';
import {
  useAccount,
  useChainId,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useQueryClient,
} from 'wagmi';

import useWearerDetails from './useWearerDetails';

const useHatClaimBy = ({
  selectedHat,
  chainId,
  wearer,
  handlePendingTx,
  onSuccess,
}: {
  selectedHat?: AppHat | null;
  chainId: SupportedChains | undefined;
  wearer: Hex | undefined;
  handlePendingTx?: HandlePendingTx;
  onSuccess?: () => void;
}) => {
  const [claimsHatter, setClaimsHatter] = useState<Module | undefined>();
  const { address } = useAccount();
  const userChain = useChainId();
  const toast = useToast();
  const isCurrentWearer = address === wearer;
  const queryClient = useQueryClient();

  const waitForSubgraph = useWaitForSubgraph({
    fetchHelper: () => fetchHatDetails(selectedHat?.id, chainId),
    checkResult: (hatDetails) =>
      _.some(
        hatDetails?.wearers,
        (w: { id: Hex }) => _.toLower(w.id) === _.toLower(address),
      ),
  });

  const { data: wearerData } = useWearerDetails({
    wearerAddress: wearer,
    chainId,
  });

  const isWearing = useMemo(
    () => _.includes(_.map(wearerData, 'id'), selectedHat?.id),
    [selectedHat, wearerData],
  );

  const claimsHatterAddress: Hex | undefined = useMemo(
    () => _.get(_.first(_.get(selectedHat, 'claimableBy')), 'id') as Hex,
    [selectedHat],
  );

  const hatter = {
    address: claimsHatterAddress,
    abi: claimsHatter?.abi,
    chainId,
  };

  const { data: isClaimableData } = useContractReads({
    contracts: [
      {
        ...hatter,
        functionName: 'accountCanClaim',
        args: [wearer || '0x', selectedHat?.id || '0x'],
      },
      {
        ...hatter,
        functionName: 'wearsAdmin',
        args: [selectedHat?.id || '0x'],
      },
    ],
    enabled:
      !!claimsHatter &&
      !!claimsHatterAddress &&
      // userChain === chainId &&
      !!selectedHat &&
      (!!address || !!wearer),
  });

  const [isClaimable, isClaimableAdmin] = useMemo(
    () => _.map(isClaimableData, 'result') || [false, false],
    [isClaimableData],
  );

  useEffect(() => {
    const getHatter = async () => {
      const moduleClient = await createHatsModulesClient(chainId);
      if (!moduleClient) return;
      const modules = moduleClient?.getAllModules();
      if (!modules) return;
      const moduleData = _.find(modules, {
        name: CONFIG.claimsHatterModuleName,
      });
      if (!moduleData) return;
      setClaimsHatter(moduleData);
    };
    getHatter();
  }, [chainId]);

  const { config, error: prepareError } = usePrepareContractWrite({
    address: claimsHatterAddress,
    chainId,
    abi: claimsHatter?.abi,
    functionName: isCurrentWearer ? 'claimHat' : 'claimHatFor',
    args: isCurrentWearer ? [selectedHat?.id] : [selectedHat?.id, address],
    enabled:
      (isCurrentWearer || !!wearer) &&
      !!isClaimable &&
      !isWearing &&
      !!isClaimableAdmin &&
      !!claimsHatter &&
      !!claimsHatterAddress &&
      userChain === chainId,
  });

  const {
    write,
    error: writeError,
    isLoading,
  } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      const txDescription = `You've claimed ${
        selectedHat?.id
          ? `hat ID ${hatIdDecimalToIp(BigInt(selectedHat?.id))}`
          : 'this hat'
      }.`;

      await handlePendingTx?.({
        hash: data.hash,
        txChainId: chainId,
        txDescription,
        toastData: {
          title: 'Hat claimed!',
          description: txDescription,
        },
        onSuccess: async () => {
          onSuccess?.();
          await waitForSubgraph();

          queryClient.invalidateQueries({
            queryKey: ['hatDetails', { id: selectedHat?.id, chainId }],
          });
          queryClient.invalidateQueries({
            queryKey: ['wearerDetails', { wearerAddress: address, chainId }],
          });
        },
      });

      // TODO Handle clearing/updating hat/wearer data
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
    claimHat: write,
    isClaimable,
    hatterAddress: claimsHatterAddress,
    hatterIsAdmin: isClaimableAdmin,
    prepareError,
    writeError,
    canClaimFor: isClaimable && write,
    error: prepareError || writeError,
    isLoading,
  };
};

export default useHatClaimBy;
