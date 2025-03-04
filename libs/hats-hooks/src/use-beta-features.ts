import { CONFIG } from '@hatsprotocol/config';
import { useLocalStorage } from 'hooks';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { Hex } from 'viem';

import { useWearerDetails } from './use-wearer-details';

interface UseBetaFeaturesProps {
  address: Hex;
  chainId: number;
}

interface UseBetaFeaturesResult {
  isCommunityMember: boolean;
  betaFeaturesEnabled: boolean;
  showBetaFeatures: boolean;
  setShowBetaFeatures: (value: boolean) => void;
  canAccessBetaFeatures: boolean;
}

/**
 * Hook to manage beta features access based on community membership, PostHog flags, and user preferences
 * @param address The user's wallet address
 * @param chainId The current chain ID
 * @returns Object containing beta features state and controls
 */
export const useBetaFeatures = ({ address, chainId }: UseBetaFeaturesProps): UseBetaFeaturesResult => {
  const { data: wearerHats } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });

  // Check if user is a community member by checking if they wear the community hat
  const isCommunityMember = useMemo(() => {
    if (!wearerHats || !Array.isArray(wearerHats)) return false;
    return wearerHats.some(
      (hat) =>
        hat.id === CONFIG.agreementV0.communityHatId &&
        hat.wearers?.some((wearer: { id: string }) => wearer.id.toLowerCase() === address.toLowerCase()),
    );
  }, [wearerHats, address]);

  // Get PostHog beta features flag, defaulting to false if undefined
  const betaFeaturesEnabled = useMemo(() => posthog.isFeatureEnabled('beta-features') ?? false, []);

  // Get initial value from local storage
  const initialBetaFeatures = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('showBetaFeatures');
    return stored ? JSON.parse(stored) : false;
  }, []);

  // Manage local storage state
  const [showBetaFeatures, setShowBetaFeatures] = useLocalStorage<boolean>('showBetaFeatures', initialBetaFeatures);

  // Combine all conditions for beta features access
  const canAccessBetaFeatures = useMemo(
    () => isCommunityMember && betaFeaturesEnabled && showBetaFeatures,
    [isCommunityMember, betaFeaturesEnabled, showBetaFeatures],
  );

  return {
    isCommunityMember,
    betaFeaturesEnabled,
    showBetaFeatures,
    setShowBetaFeatures,
    canAccessBetaFeatures,
  };
};
