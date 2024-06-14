import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from 'hooks';
import _ from 'lodash';
import { useMemo } from 'react';
import { idToIp } from 'shared';
import { AppHat, SupportedChains } from 'types';
import { createHatsClient, formatAddress } from 'utils';
import { Hex, isAddress } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import useMultiClaimsHatterCheck from './useMultiClaimsHatterCheck';

const checkCanClaimForWearer = async ({
  chainId,
  hatId,
  wearer,
}: {
  chainId: number | undefined;
  hatId: Hex | undefined;
  wearer: Hex | undefined;
}) => {
  const hatsClient = createHatsClient(chainId);
  if (!hatsClient || !wearer || !hatId || !isAddress(wearer)) return false;

  const canClaimFor = await hatsClient.canClaimForAccount({
    hatId: BigInt(hatId),
    account: wearer,
  });

  return canClaimFor;
};

const useHatClaimFor = ({
  selectedHat,
  chainId,
  wearer,
  onchainHats,
}: {
  selectedHat?: AppHat | null;
  chainId?: SupportedChains;
  wearer: Hex | undefined;
  onchainHats?: AppHat[] | undefined; // passed to useMultiClaimsHatterCheck
}) => {
  const { address } = useAccount();
  const toast = useToast();

  const claimableForAddress: Hex | undefined = useMemo(
    () => _.get(_.first(_.get(selectedHat, 'claimableForBy')), 'id') as Hex,
    [selectedHat],
  );

  const { multiClaimsHatter: claimsHatter } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    onchainHats,
  });

  const { data: isClaimableFor, isLoading: isLoadingClaimableFor } =
    useReadContract({
      address: claimableForAddress,
      abi: claimsHatter?.abi,
      chainId,
      functionName: 'isClaimableFor',
      args: [wearer || '0x', selectedHat?.id || '0x'],
    });

  const {
    data: canClaimForAccount,
    isLoading: canClaimForAccountLoading,
    error: canClaimForAccountError,
  } = useQuery({
    queryKey: ['claimFor', selectedHat?.id, chainId, wearer],
    queryFn: () =>
      checkCanClaimForWearer({ chainId, hatId: selectedHat?.id, wearer }),
    enabled: !!selectedHat?.id && !!wearer,
  });

  const claimHatFor = async (account: Hex) => {
    const hatsClient = createHatsClient(chainId);
    if (!hatsClient || !address) return undefined;

    return hatsClient
      .claimHatFor({
        account: address,
        hatId: BigInt(selectedHat?.id || '0x'),
        wearer: account,
      })
      .then((result) => {
        return result;
      })
      .catch((error) => error);
  };

  const { mutateAsync } = useMutation({
    mutationKey: ['claimHatFor', selectedHat?.id],
    mutationFn: claimHatFor,
    onSuccess: (result) => {
      if (result?.status === 'success') {
        toast.success({
          title: 'Hat claimed',
          description: `Hat ${idToIp(
            selectedHat?.id,
          )} has been claimed for ${formatAddress(wearer)}`,
        });
      }
    },
    onError: (error) => {
      const err = error as Error;
      toast.error({
        title: 'Transaction failed',
        description: err.message,
      });
      // eslint-disable-next-line no-console
      console.log('Error claiming hat:', err);
    },
  });

  return {
    claimHatFor: mutateAsync,
    isClaimableFor,
    canClaimForAccount,
    canClaimForAccountError,
    isLoading: canClaimForAccountLoading || isLoadingClaimableFor,
  };
};

export default useHatClaimFor;
