import { CONFIG } from '@hatsprotocol/config';
import { Module } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { useToast, useWaitForSubgraph } from 'hooks';
import { find, first, get, map } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { AppHat, HandlePendingTx, SupportedChains, SyncTxHandler } from 'types';
import { createHatsModulesClient } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId, useReadContracts, useWalletClient, useWriteContract } from 'wagmi';

const useHatClaimBy = ({ selectedHat, chainId, wearer, handlePendingTx, afterSuccess }: UseHatClaimByProps) => {
  const [claimsHatter, setClaimsHatter] = useState<Module | undefined>();
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { toast } = useToast();
  const isCurrentWearer = address === wearer;
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();

  const claimsHatterAddress = useMemo(
    () => get(first(get(selectedHat, 'claimableBy')), 'id') as Hex | undefined,
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
    () => map(isClaimableData, 'result') || [false, false],
    [isClaimableData],
  );

  useEffect(() => {
    const getHatter = async () => {
      if (chainId !== currentChainId) return; // This is due to an error thrown based on the 'current chain' in wagmi config
      const moduleClient = await createHatsModulesClient(chainId, walletClient); // used to create the module client here
      if (!moduleClient) return;
      const modules = moduleClient?.getModules();
      if (!modules) return;
      const moduleData = find(modules, {
        name: CONFIG.modules.claimsHatter,
      });
      if (!moduleData) return;
      setClaimsHatter(moduleData);
    };
    getHatter();
  }, [chainId, currentChainId]);

  const { writeContractAsync } = useWriteContract();
  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const onSuccess = async () => {
    onSuccess?.();

    queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
    queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
    queryClient.invalidateQueries({ queryKey: ['treeDetails'] });
  };

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
        toast({
          title: 'Transaction submitted',
          description: 'Waiting for your transaction to be accepted...',
        });

        const txDescription = selectedHat?.id ? `You've claimed Hat ${hatIdDecimalToIp(BigInt(selectedHat?.id))}` : ''; // TODO add hat name

        handlePendingTx?.({
          hash,
          txChainId: chainId,
          txDescription,
          successToastData: {
            title: 'Hat claimed!', // TODO add hat name
            description: txDescription,
          },
          waitForSubgraph,
          onSuccess,
        });
      })
      .catch((error) => {
        if (
          (error.name === 'TransactionExecutionError' || error.name === 'ContractFunctionExecutionError') &&
          error.message.includes('User rejected the request')
        ) {
          toast({
            title: 'Signature rejected!',
            description: 'Please accept the transaction in your wallet',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error occurred!',
            description: 'An error occurred while processing the transaction.',
            variant: 'destructive',
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

interface UseHatClaimByProps {
  selectedHat?: AppHat | null;
  chainId: SupportedChains | undefined;
  wearer: Hex | undefined;
  handlePendingTx: HandlePendingTx | undefined;
  afterSuccess?: SyncTxHandler;
}

export { useHatClaimBy };
