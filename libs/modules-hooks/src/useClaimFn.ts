import { useDisclosure } from '@chakra-ui/react';
import {
  CLAIM_STATUS,
  CONFIG,
  ELIGIBILITY_MODULES,
  TOASTS,
} from '@hatsprotocol/constants';
import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { HATS_ABI } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { useWearerDetails } from 'hats-hooks';
import { useAgreementClaimsHatterContractWrite } from 'hooks';
import { find, pick } from 'lodash';
import { useMemo, useState } from 'react';
import { AppHat, HandlePendingTx, SupportedChains, ToastProps } from 'types';
import { Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import useAgreementClaim from './useAgreementClaim';
import useMultiClaimsHatterCheck from './useMultiClaimsHatterCheck';
import { useSubscriptionClaim } from './useSubscriptionClaim';

const COMMUNITY_HAT_ID = CONFIG.agreementV0.communityHatId;

export const useClaimFn = ({
  selectedHat,
  handlePendingTx,
  moduleParameters,
  moduleDetails,
  controllerAddress,
  chainId,
  isReadyToClaim,
}: UseClaimFnProps) => {
  const [status, setStatus] = useState<
    (typeof CLAIM_STATUS)[keyof typeof CLAIM_STATUS]
  >(CLAIM_STATUS.PENDING);

  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { address } = useAccount();

  const { data: wearerHats, isLoading: isLoadingWearerDetails } =
    useWearerDetails({
      wearerAddress: address as Hex,
      chainId,
    });
  const isWearing = find(wearerHats, { id: selectedHat?.id });

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

  const { instanceAddress, currentHatIsClaimable, hatterIsAdmin } =
    useMultiClaimsHatterCheck({
      chainId,
      selectedHat,
      onchainHats: selectedHat ? [selectedHat] : [],
    });

  // TODO handle check which module to enable each hook

  // SUBSCRIPTION via UNLOCK
  const {
    claimFn: subscriptionClaim,
    disableClaim: subscriptionDisableClaim,
    disableReason: subscriptionDisableReason,
  } = useSubscriptionClaim({
    moduleParameters,
    moduleDetails,
    chainId,
    controllerAddress,
    status,
    setStatus,
  });

  // AGREEMENT v1
  const { signAndClaim: agreementClaim, isLoading: isLoadingAgreementClaim } =
    useAgreementClaim({
      moduleParameters,
      moduleDetails,
      chainId,
      controllerAddress,
      mchAddress: instanceAddress,
      onSuccessfulSign: () => {
        setStatus(CLAIM_STATUS.SUCCESS);

        queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
        queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
      },
      onDecline: () => {
        setStatus(CLAIM_STATUS.DECLINED);
      },
    });

  // AGREEMENT v0
  const { writeAsync: agreementV0Claim, isLoading: isLoadingAgreementV0Claim } =
    useAgreementClaimsHatterContractWrite({
      functionName: 'claimHatWithAgreement',
      address: CONFIG.agreementV0.hatterAddress as Hex,
      chainId,
      enabled:
        Boolean(COMMUNITY_HAT_ID) && !isLoadingWearerDetails && !isWearing,
      successToastData: TOASTS.claimHatWithAgreement as ToastProps,
      onDecline: () => {
        setStatus(CLAIM_STATUS.DECLINED);
      },
    });

  const claimHandlers = useMemo(() => {
    if (moduleDetails?.name === ELIGIBILITY_MODULES.agreement) {
      return { claimFn: agreementClaim, disableClaim: !isReadyToClaim };
    }

    if (selectedHat?.id === CONFIG.agreementV0.communityHatId) {
      return { claimFn: agreementV0Claim, disableClaim: !isReadyToClaim };
    }

    if (moduleDetails?.name === ELIGIBILITY_MODULES.unlock) {
      return {
        claimFn: subscriptionClaim,
        disableClaim: subscriptionDisableClaim,
        disableReason: subscriptionDisableReason,
      };
    }

    if (moduleDetails?.name === ELIGIBILITY_MODULES.election) {
      // TODO hook up
      return { claimFn: () => undefined, disableClaim: true };
    }

    return { claimFn: undefined, disableClaim: true };
  }, [
    moduleDetails?.name,
    selectedHat?.id,
    agreementClaim,
    agreementV0Claim,
    subscriptionClaim,
    subscriptionDisableClaim,
    subscriptionDisableReason,
    isReadyToClaim,
  ]);

  const handleClaim = async () => {
    const { claimFn, disableClaim } = pick(claimHandlers, [
      'claimFn',
      'disableClaim',
    ]);
    if (!claimFn || disableClaim) {
      // eslint-disable-next-line no-console
      console.log('claim disabled');
      return;
    }
    setStatus(CLAIM_STATUS.CLAIMING);

    return claimFn?.()?.then(() => {
      // MODAL used for pending tx handler, not claiming
      onOpen();
    });
  };

  return {
    handleClaim,
    disableClaim: claimHandlers.disableClaim,
    disableReason: claimHandlers.disableReason,
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
  isReadyToClaim: boolean | undefined;
}
