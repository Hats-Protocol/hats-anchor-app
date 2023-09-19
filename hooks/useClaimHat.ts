import { Module } from '@hatsprotocol/modules-sdk';
import { hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Hex } from 'viem';
import {
  useAccount,
  // useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi';

import { useOverlay } from '@/contexts/OverlayContext';
import { createHatsModulesClient } from '@/lib/web3';
import { IHat } from '@/types';

import useToast from './useToast';

const useClaimHat = ({
  hatData,
  wearer,
  claimsHatterAddress,
}: {
  hatData: IHat | undefined;
  claimsHatterAddress: Hex;
  wearer: Hex | undefined;
}) => {
  const [claimsHatter, setClaimsHatter] = useState<Module | undefined>();
  const { address } = useAccount();
  const toast = useToast();
  const { handlePendingTx } = useOverlay();
  const isCurrentWearer = address === wearer;

  // not handling claim for yet
  // const { data: canClaimFor } = useContractRead({
  //   address: claimsHatterAddress,
  //   abi: claimsHatter?.abi,
  //   functionName: 'canClaimFor',
  //   args: [address],
  // });

  useEffect(() => {
    const getHatter = async () => {
      const moduleClient = await createHatsModulesClient(hatData?.chainId);
      if (!moduleClient) return;
      const modules = moduleClient?.getAllModules();
      if (!modules) return;
      // better option? subgraph lookup, reverse implementation lookup?
      const moduleData = _.find(_.values(modules), ['name', 'Claims Hatter']);
      if (!moduleData) return;
      setClaimsHatter(moduleData);
    };
    getHatter();
  }, [hatData?.chainId]);

  const { config, error: prepareError } = usePrepareContractWrite({
    address: claimsHatterAddress,
    chainId: hatData?.chainId,
    abi: claimsHatter?.abi,
    functionName: isCurrentWearer ? 'claimHat' : 'claimHatFor',
    args: isCurrentWearer ? [] : [wearer],
    enabled: (isCurrentWearer || !!wearer) && !!hatData && !!claimsHatter,
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
            hatData?.id
              ? `hat ID ${hatIdHexToDecimal(hatData?.id)}`
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
    prepareError,
    writeError,
    // canClaimFor,
    error: prepareError || writeError,
  };
};

export default useClaimHat;
