import { useDisclosure } from '@chakra-ui/react';
import { CLAIM_STATUS, CONFIG } from '@hatsprotocol/constants';
import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { HATS_ABI } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { AppHat, HandlePendingTx, SupportedChains } from 'types';
import { Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import useAgreementClaim from './useAgreementClaim';
import useMultiClaimsHatterCheck from './useMultiClaimsHatterCheck';
import { useSubscriptionClaim } from './useSubscriptionClaim';

export const useClaimFn = ({
  selectedHat,
  handlePendingTx,
  moduleParameters,
  moduleDetails,
  controllerAddress,
  chainId,
}: UseClaimFnProps) => {
  const [status, setStatus] = useState<
    (typeof CLAIM_STATUS)[keyof typeof CLAIM_STATUS]
  >(CLAIM_STATUS.PENDING);

  const claimType = useMemo(() => {
    return 'agreement';
  }, [selectedHat]);

  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { address } = useAccount();

  const { data: isEligible } = useReadContract({
    address: CONFIG.hatsAddress,
    abi: HATS_ABI,
    functionName: 'isEligible',
    args: [
      address as Hex,
      selectedHat?.id ? BigInt(selectedHat.id) : BigInt(0),
    ],
    chainId,
  });
  console.log({ isEligible });

  const { instanceAddress, currentHatIsClaimable, hatterIsAdmin } =
    useMultiClaimsHatterCheck({
      chainId,
      selectedHat,
      onchainHats: selectedHat ? [selectedHat] : [],
    });

  const { claimFn: subscriptionClaim, disableClaim: subscriptionDisableClaim } =
    useSubscriptionClaim({
      moduleParameters,
      moduleDetails,
      chainId,
      controllerAddress,
      status,
      setStatus,
    });

  const { signAndClaim, isLoading } = useAgreementClaim({
    moduleParameters,
    moduleDetails,
    chainId,
    controllerAddress,
    mchAddress: instanceAddress,
    onSuccessfulSign: () => {
      setStatus(CLAIM_STATUS.SUCCESS);

      // should implement useWaitForSubgraph when merged
      queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
      queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
    },
    onDecline: () => {
      setStatus(CLAIM_STATUS.DECLINED);
    },
  });

  const claimHandlers = useMemo(() => {
    if (claimType === 'agreement') {
      return {
        claimFn: signAndClaim,
        disableClaim: false,
      };
    }

    if (claimType === 'subscription') {
      return {
        claimFn: subscriptionClaim,
        disableClaim: subscriptionDisableClaim,
      };
    }

    return {
      claimFn: undefined,
      disableClaim: true,
    };
  }, [claimType, signAndClaim, subscriptionClaim, subscriptionDisableClaim]);

  const handleClaim = () => {
    if (!claimHandlers.claimFn || claimHandlers.disableClaim) {
      console.log('claim disabled');
      return;
    }

    claimHandlers.claimFn?.();
    setStatus(CLAIM_STATUS.CLAIMING);

    // MODAL used for pending tx handler
    onOpen();
  };

  return {
    handleClaim,
    disableClaim: claimHandlers.disableClaim,
    isEligible,
    status,
    isLoading: status === CLAIM_STATUS.CLAIMING,
    isOpen,
    onClose,
  };
};

interface UseClaimFnProps {
  selectedHat: AppHat | undefined;
  handlePendingTx: HandlePendingTx | undefined;
  moduleParameters: ModuleParameter[] | undefined;
  moduleDetails: Module | undefined;
  controllerAddress: string | undefined;
  chainId: SupportedChains | undefined;
}
