import { Module } from '@hatsprotocol/modules-sdk';
import { hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { Hex } from 'viem';
import {
  useAccount,
  useChainId,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi';

import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { createHatsModulesClient } from '@/lib/web3';

import useIsAdmin from './useIsAdmin';
import useToast from './useToast';

const useHatClaim = ({ wearer }: { wearer: Hex | undefined }) => {
  const [claimsHatter, setClaimsHatter] = useState<Module | undefined>();
  const { chainId, selectedHat } = useTreeForm();
  const { address } = useAccount();
  const userChain = useChainId();
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const isCurrentWearer = address === wearer;

  const claimsHatterAddress: Hex | undefined = useMemo(
    () => _.get(_.first(_.get(selectedHat, 'claimableBy')), 'id'),
    [selectedHat],
  );

  const claimableForAddress: Hex | undefined = useMemo(
    () => _.get(_.first(_.get(selectedHat, 'claimableForBy')), 'id'),
    [selectedHat],
  );

  const hatterIsAdmin = useIsAdmin(claimsHatterAddress);

  const { data: isClaimableFor } = useContractRead({
    address: claimableForAddress,
    abi: claimsHatter?.abi,
    functionName: 'isClaimableFor',
    args: [selectedHat?.id, address],
    enabled: !!claimsHatter && !!claimsHatterAddress && userChain === chainId,
  });

  useEffect(() => {
    const getHatter = async () => {
      const moduleClient = await createHatsModulesClient(chainId);
      if (!moduleClient) return;
      const modules = moduleClient?.getAllModules();
      if (!modules) return;
      const moduleData = _.get(modules, CONFIG.claimsHatterModuleId);
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
      !!claimsHatter &&
      !!claimsHatterAddress &&
      !!hatterIsAdmin &&
      userChain === chainId,
  });

  const { write, error: writeError } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx?.({
        hash: data.hash,
        toastData: {
          title: 'Hat claimed!',
          description: `You've claimed ${
            selectedHat?.id
              ? `hat ID ${hatIdHexToDecimal(selectedHat?.id)}`
              : 'this hat'
          }.`,
        },
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
    claimHat: write,
    hatterIsAdmin,
    prepareError,
    writeError,
    canClaimFor: isClaimableFor && write,
    error: prepareError || writeError,
  };
};

export default useHatClaim;
