import { Module } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { CONFIG } from 'app-constants';
import { useToast } from 'app-hooks';
import { createHatsModulesClient } from 'app-utils';
import { AppHat, HandlePendingTx, SupportedChains } from 'hats-types';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { Hex } from 'viem';
import {
  useAccount,
  useChainId,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi';

const CLAIMS_HATTER_TYPES = {
  claimableBy: 'CLAIMABLE_BY',
  claimableFor: 'CLAIMABLE_FOR',
};

const useHatClaim = ({
  selectedHat,
  chainId,
  wearer,
  handlePendingTx,
}: {
  selectedHat: AppHat;
  chainId: SupportedChains;
  wearer: Hex | undefined;
  handlePendingTx?: HandlePendingTx;
}) => {
  const [claimsHatter, setClaimsHatter] = useState<Module | undefined>();
  const { address } = useAccount();
  const userChain = useChainId();
  const toast = useToast();
  const isCurrentWearer = address === wearer;

  const isWearing = useMemo(
    () => _.includes(_.map(selectedHat?.wearers, 'id'), wearer),
    [selectedHat, wearer],
  );

  const claimsHatterAddress: Hex | undefined = useMemo(
    () => _.get(_.first(_.get(selectedHat, 'claimableBy')), 'id') as Hex,
    [selectedHat],
  );

  const claimableForAddress: Hex | undefined = useMemo(
    () => _.get(_.first(_.get(selectedHat, 'claimableForBy')), 'id') as Hex,
    [selectedHat],
  );

  const hatter = (type: string) => ({
    address:
      type === CLAIMS_HATTER_TYPES.claimableFor
        ? claimableForAddress
        : claimsHatterAddress,
    abi: claimsHatter?.abi,
    chainId,
  });

  const { data: isClaimableData } = useContractReads({
    contracts: [
      {
        ...hatter(
          isCurrentWearer
            ? CLAIMS_HATTER_TYPES.claimableBy
            : CLAIMS_HATTER_TYPES.claimableFor,
        ),
        functionName: isCurrentWearer
          ? 'accountCanClaim'
          : 'canClaimForAccount',
        args: [wearer || '0x', selectedHat?.id || '0x'],
      },
      {
        ...hatter(
          isCurrentWearer
            ? CLAIMS_HATTER_TYPES.claimableBy
            : CLAIMS_HATTER_TYPES.claimableFor,
        ),
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

  const { write, error: writeError } = useContractWrite({
    ...config,
    onSuccess: async (data) => {
      toast.info({
        title: 'Transaction submitted',
        description: 'Waiting for your transaction to be accepted...',
      });

      await handlePendingTx?.({
        hash: data.hash,
        txChainId: chainId,
        fnName: 'Claim Hat',
        toastData: {
          title: 'Hat claimed!',
          description: `You've claimed ${
            selectedHat?.id
              ? `hat ID ${hatIdDecimalToIp(BigInt(selectedHat?.id))}`
              : 'this hat'
          }.`,
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
    hatterAddress: claimableForAddress || claimsHatterAddress,
    hatterIsAdmin: isClaimableAdmin,
    prepareError,
    writeError,
    canClaimFor: isClaimable && write,
    error: prepareError || writeError,
  };
};

export default useHatClaim;
