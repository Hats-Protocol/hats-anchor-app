import { CONFIG } from '@hatsprotocol/config';
import { CLAIM_STATUS } from '@hatsprotocol/constants';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { HATS_ABI, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { useWearerDetails } from 'hats-hooks';
import { useAgreementClaimsHatterContractWrite } from 'hooks';
import { find, get, pick } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { AppHat, HandlePendingTx, ModuleDetails, SupportedChains } from 'types';
import { getKnownEligibilityModule } from 'utils';
import { Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import { useAgreementClaim } from './use-agreement-claim';
import { useHatClaimFor } from './use-hat-claim-for';
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
  onSuccess,
  onError,
  onDecline,
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
    currentHatIsClaimable,
    hatterIsAdmin,
  } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    onchainHats: selectedHat ? [selectedHat] : [],
  });

  const { claimHatFor } = useHatClaimFor({
    selectedHat,
    chainId,
    wearer: address as Hex,
    handlePendingTx,
  });

  const genericClaim = useCallback(async () => {
    console.log('generic claim', address);
    return claimHatFor(address as Hex)
      .then((result) => {
        console.log('generic claim result', result);
        return result;
      })
      .catch((err) => console.log(err));
  }, [claimHatFor, address]);

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
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
      queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
    },
    onDecline: () => {
      setStatus(CLAIM_STATUS.DECLINED);
      onDecline?.();
    },
    // onError: () => { // TODO handle these error cases
    //   onError?.();
    // },
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
      onSuccess?.();
    },
    onDecline: () => {
      setStatus(CLAIM_STATUS.DECLINED);
      onDecline?.();
    },
    // onError: () => {
    //   onError?.();
    // },
  });

  const claimHandlers = useMemo(() => {
    console.log('claim handlers', isReadyToClaim, moduleDetails);
    if (chainId === 10 && selectedHat?.id === CONFIG.agreementV0.communityHatId) {
      const agreementV0 = '0xd0929e6ae5406cbee08604de99f83cf2ce52d903'; // Community Hat module, to be deprecated in season 4
      const notReady = !get(isReadyToClaim, agreementV0, false);

      return {
        claimFn: agreementV0Claim,
        disableClaim: notReady,
        requireHatter: false,
        disableReason: notReady ? 'Accept the agreement to claim' : undefined,
      };
    }

    // if (!moduleDetails?.implementationAddress || !moduleDetails.instanceAddress) {
    //   return { claimFn: undefined, disableClaim: true, requireHatter: false };
    // }

    if (getKnownEligibilityModule(moduleDetails?.implementationAddress as Hex) === 'agreement') {
      return {
        claimFn: agreementClaim,
        requireHatter: true,
        disableClaim: !get(isReadyToClaim, moduleDetails?.instanceAddress as Hex, false) && !isEligible,
      };
    }

    if (getKnownEligibilityModule(moduleDetails?.implementationAddress as Hex) === 'unlock') {
      return {
        claimFn: subscriptionClaim,
        requireHatter: false, // TODO could check if subscription module is wearing appropriate admin hat
        disableClaim: subscriptionDisableClaim,
        disableReason: subscriptionDisableReason,
      };
    }

    if (getKnownEligibilityModule(moduleDetails?.implementationAddress as Hex) === 'election') {
      // TODO hook up
      return {
        claimFn: () => undefined,
        disableClaim: true,
        disableReason: 'Election module not implemented',
        requireHatter: true,
      };
    }
    console.log('generic claim');

    let disableReason: string | undefined;
    if (!currentHatIsClaimable?.by || !currentHatIsClaimable?.for) {
      disableReason = 'Current Hat is not claimable';
    } else if (!hatterIsAdmin) {
      disableReason = 'Claims Hatter is not admin';
    }

    // TODO fallback to claim with MCH when eligible
    return {
      claimFn: genericClaim,
      disableClaim: !currentHatIsClaimable || !hatterIsAdmin,
      disableReason,
      requireHatter: true,
    };
  }, [
    moduleDetails?.implementationAddress,
    moduleDetails?.instanceAddress,
    selectedHat?.id,
    agreementClaim,
    agreementV0Claim,
    subscriptionClaim,
    subscriptionDisableClaim,
    subscriptionDisableReason,
    isReadyToClaim,
    isEligible,
    chainId,
    currentHatIsClaimable,
    hatterIsAdmin,
    genericClaim,
  ]);

  const handleClaim = async () => {
    const { claimFn, disableClaim } = pick(claimHandlers, ['claimFn', 'disableClaim']);
    if (!claimFn || disableClaim) {
      // eslint-disable-next-line no-console
      console.log('claim disabled');
      return;
    }
    setStatus(CLAIM_STATUS.CLAIMING);

    return claimFn?.()
      ?.then(() => {
        // MODAL here is used for pending tx handler, not claiming
        onOpen();
      })
      .catch((err) => {
        console.log('claim error', err);
        onError?.();
      });
  };

  return {
    handleClaim,
    disableClaim: claimHandlers?.disableClaim,
    disableReason: claimHandlers?.disableReason,
    requireHatter: claimHandlers?.requireHatter,
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
  onSuccess: () => void;
  onError: () => void;
  onDecline: () => void;
}
