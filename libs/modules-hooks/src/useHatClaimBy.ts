'use client';

import { CONFIG } from '@hatsprotocol/constants';
import { Module } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { useToast, useWaitForSubgraph } from 'hooks';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { AppHat, HandlePendingTx, SupportedChains } from 'types';
import {
  createHatsModulesClient,
  fetchHatDetails,
  invalidateAfterTransaction,
} from 'utils';
import { Hex } from 'viem';
import {
  useAccount,
  useChainId,
  useReadContracts,
  useWriteContract,
} from 'wagmi';

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
  const currentChainId = useChainId();
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

  const claimsHatterAddress: Hex | undefined = useMemo(
    () => _.get(_.first(_.get(selectedHat, 'claimableBy')), 'id') as Hex,
    [selectedHat],
  );

  const hatter = {
    address: claimsHatterAddress,
    abi: claimsHatter?.abi,
    chainId,
  };

  const { data: isClaimableData } = useReadContracts({
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
  });

  const [isClaimable, isClaimableAdmin] = useMemo(
    () => _.map(isClaimableData, 'result') || [false, false],
    [isClaimableData],
  );

  useEffect(() => {
    const getHatter = async () => {
      if (chainId !== currentChainId) return; // This is due to an error thrown based on the 'current chain' in wagmi config
      const moduleClient = await createHatsModulesClient(chainId); // used to create the module client here
      if (!moduleClient) return;
      const modules = moduleClient?.getModules();
      if (!modules) return;
      const moduleData = _.find(modules, {
        name: CONFIG.modules.claimsHatter,
      });
      if (!moduleData) return;
      setClaimsHatter(moduleData);
    };
    getHatter();
  }, [chainId, currentChainId]);

  const { writeContractAsync } = useWriteContract();

  const writeAsync = async () => {
    if (!claimsHatterAddress || !chainId || !claimsHatter?.abi) return null;

    return writeContractAsync({
      address: claimsHatterAddress,
      chainId,
      abi: claimsHatter?.abi,
      functionName: isCurrentWearer ? 'claimHat' : 'claimHatFor',
      args: isCurrentWearer ? [selectedHat?.id] : [selectedHat?.id, address],
    })
      .then((hash) => {
        toast.info({
          title: 'Transaction submitted',
          description: 'Waiting for your transaction to be accepted...',
        });

        const txDescription = `You've claimed ${selectedHat?.id
          ? `hat ID ${hatIdDecimalToIp(BigInt(selectedHat?.id))}`
          : 'this hat'
          }.`;

        handlePendingTx?.({
          hash,
          txChainId: chainId,
          txDescription,
          successToastData: {
            title: 'Hat claimed!',
            description: txDescription,
          },
          onSuccess: async () => {
            onSuccess?.();
            await waitForSubgraph();
            await invalidateAfterTransaction(chainId, hash);

            queryClient.invalidateQueries({
              queryKey: ['hatDetails', { id: selectedHat?.id, chainId }],
            });
            queryClient.invalidateQueries({
              queryKey: ['wearerDetails', { wearerAddress: address, chainId }],
            });
          },
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
          toast.error({
            title: 'Error occurred!',
            description: 'An error occurred while processing the transaction.',
          });
        }
      });
  };

  return {
    claimHat: writeAsync,
    isClaimable,
    hatterAddress: claimsHatterAddress,
    hatterIsAdmin: isClaimableAdmin,
    canClaimFor: isClaimable,
  };
};

export default useHatClaimBy;
