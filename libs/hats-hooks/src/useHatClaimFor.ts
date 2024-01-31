import { Module } from '@hatsprotocol/modules-sdk';
import { CONFIG } from 'app-constants';
import { useToast } from 'app-hooks';
import {
  createHatsClient,
  createHatsModulesClient,
  formatAddress,
} from 'app-utils';
import { AppHat, SupportedChains } from 'hats-types';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { idToIp } from 'shared-utils';
import { Hex, isAddress } from 'viem';
import { useAccount, useContractRead } from 'wagmi';

const useHatClaimFor = ({
  selectedHat,
  chainId,
  wearer,
}: {
  selectedHat: AppHat;
  chainId: SupportedChains;
  wearer: Hex | undefined;
}) => {
  const [claimsHatter, setClaimsHatter] = useState<Module | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const toast = useToast();

  const [canClaimForAccount, setCanClaimForAccount] = useState<boolean>();

  const claimableForAddress: Hex | undefined = useMemo(
    () => _.get(_.first(_.get(selectedHat, 'claimableForBy')), 'id') as Hex,
    [selectedHat],
  );

  const { data: isClaimableFor, isLoading: isLoadingClaimableFor } =
    useContractRead({
      address: claimableForAddress,
      abi: claimsHatter?.abi,
      chainId,
      functionName: 'isClaimableFor',
      args: [wearer || '0x', selectedHat?.id || '0x'],
      enabled:
        !!claimsHatter &&
        // userChain === chainId &&
        !!selectedHat &&
        (!!address || !!wearer),
    });

  useEffect(() => {
    const getCanClaimForAccount = async () => {
      const hatsClient = createHatsClient(chainId);
      if (!hatsClient || !wearer || !isAddress(wearer)) return;
      const canClaimFor = await hatsClient.canClaimForAccount({
        hatId: BigInt(selectedHat.id),
        account: wearer,
      });
      setCanClaimForAccount(canClaimFor);
    };
    getCanClaimForAccount();
  }, [chainId, selectedHat, wearer]);

  const claimHatFor = async (account: Hex) => {
    const hatsClient = createHatsClient(chainId);
    if (!hatsClient || !address) return;

    try {
      setIsLoading(true);

      const result = await hatsClient.claimHatFor({
        account: address,
        hatId: BigInt(selectedHat.id),
        wearer: account,
      });

      if (result?.status === 'success') {
        toast.success({
          title: 'Hat claimed',
          description: `Hat ${idToIp(
            selectedHat.id,
          )} has been claimed for ${formatAddress(account)}`,
        });
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      const err = error as Error;
      toast.error({
        title: 'Transaction failed',
        description: err.message,
      });
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

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

  return {
    claimHatFor,
    isClaimableFor,
    canClaimForAccount,
    isLoading: isLoading || isLoadingClaimableFor,
  };
};

export default useHatClaimFor;
