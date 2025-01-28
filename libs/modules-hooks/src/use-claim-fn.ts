import { CONFIG } from '@hatsprotocol/config';
import { CLAIM_STATUS, ELIGIBILITY_MODULES } from '@hatsprotocol/constants';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { HATS_ABI, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { useWearerDetails } from 'hats-hooks';
import { useAgreementClaimsHatterContractWrite } from 'hooks';
import { find, get, pick } from 'lodash';
import { useMemo, useState } from 'react';
import { AppHat, HandlePendingTx, ModuleDetails, SupportedChains } from 'types';
import { Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import { useAgreementClaim } from './use-agreement-claim';
import { useMultiClaimsHatterCheck } from './use-multi-claims-hatter-check';
import { useSubscriptionClaim } from './use-subscription-claim';

const COMMUNITY_HAT_ID = CONFIG.agreementV0.communityHatId;

export const useClaimFn = ({
  selectedHat,
  handlePendingTx,
  moduleParameters,
  moduleDetails,
  chainId,
  isReadyToClaim,
}: UseClaimFnProps) => {
  const [status, setStatus] = useState<(typeof CLAIM_STATUS)[keyof typeof CLAIM_STATUS]>(CLAIM_STATUS.PENDING);
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();
  const { address } = useAccount();

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const { data: wearerHats, isLoading: isLoadingWearerDetails } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });
  const isWearing = find(wearerHats, { id: selectedHat?.id });

  const { data: isEligible } = useReadContract({
    address: HATS_V1,
    abi: HATS_ABI,
    functionName: 'isEligible',
    args: [address as Hex, selectedHat?.id ? BigInt(selectedHat.id) : BigInt(0)],
    chainId,
  });

  const {
    instanceAddress: mchAddress,
    // currentHatIsClaimable,
    // hatterIsAdmin,
  } = useMultiClaimsHatterCheck({
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
    setStatus,
    handlePendingTx,
  });

  // AGREEMENT v1
  const { signAndClaim: agreementClaim } = useAgreementClaim({
    moduleParameters,
    moduleDetails,
    chainId,
    mchAddress,
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
  const { writeAsync: agreementV0Claim } = useAgreementClaimsHatterContractWrite({
    functionName: 'claimHatWithAgreement',
    address: CONFIG.agreementV0.hatterAddress as Hex,
    chainId,
    handlePendingTx,
    enabled: Boolean(COMMUNITY_HAT_ID) && !isLoadingWearerDetails && !isWearing,
    successToastData: {
      title: 'Hat Claimed',
      description: 'Claimed with signature',
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
      queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
      queryClient.invalidateQueries({ queryKey: ['treeDetails'] });
      queryClient.invalidateQueries({ queryKey: ['readContracts'] });
      queryClient.invalidateQueries({ queryKey: ['readContract'] });

      setStatus(CLAIM_STATUS.SUCCESS);
    },
    onDecline: () => {
      setStatus(CLAIM_STATUS.DECLINED);
    },
  });

  const claimHandlers = useMemo(() => {
    if (selectedHat?.id === CONFIG.agreementV0.communityHatId) {
      const agreementV0 = '0xd0929e6ae5406cbee08604de99f83cf2ce52d903'; // Community Hat module, to be deprecated in season 4
      const notReady = !get(isReadyToClaim, agreementV0, false);

      return {
        claimFn: agreementV0Claim,
        disableClaim: notReady,
        disableReason: notReady ? 'Accept the agreement to claim' : undefined,
      };
    }

    if (!moduleDetails?.instanceAddress) {
      return { claimFn: undefined, disableClaim: true };
    }

    // TODO match on implementation address/module key
    if (moduleDetails?.name === ELIGIBILITY_MODULES.agreement) {
      return {
        claimFn: agreementClaim,
        disableClaim: !get(isReadyToClaim, moduleDetails?.instanceAddress, false) && !isEligible,
      };
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

    // TODO fallback to claim with MCH when eligible
    return { claimFn: undefined, disableClaim: true };
  }, [
    moduleDetails?.name,
    moduleDetails?.instanceAddress,
    selectedHat?.id,
    agreementClaim,
    agreementV0Claim,
    subscriptionClaim,
    subscriptionDisableClaim,
    subscriptionDisableReason,
    isReadyToClaim,
    isEligible,
  ]);

  const handleClaim = async () => {
    const { claimFn, disableClaim } = pick(claimHandlers, ['claimFn', 'disableClaim']);
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
    disableClaim: claimHandlers?.disableClaim,
    disableReason: claimHandlers?.disableReason,
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
  moduleDetails: ModuleDetails | undefined;
  chainId: SupportedChains | undefined;
  isReadyToClaim: { [key: string]: boolean } | undefined;
}
