import { CONFIG } from '@hatsprotocol/config';
import { useLocalStorage } from 'hooks';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { Hex } from 'viem';

import { useWearerDetails } from './use-wearer-details';

interface UseBetaFeaturesProps {
  address?: Hex;
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
 * Hook to manage beta features access based on wearing the Community Member Hat, PostHog flags, and user preferences
 * @param address The user's wallet address
 * @param chainId The current chain ID
 * @returns Object containing beta features state and controls
 */

export const useBetaFeatures = ({ address, chainId }: UseBetaFeaturesProps): UseBetaFeaturesResult => {
  const { data: wearerHats } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });

  // Get PostHog bucket feature flag, defaulting to false if undefined
  const betaFeaturesEnabled = useMemo(() => posthog.isFeatureEnabled('bucket') ?? false, []);

  // Manage local storage state
  const [showBetaFeatures, setShowBetaFeatures] = useLocalStorage<boolean>('showBetaFeatures', false);

  // Check if user is a community member by checking if they wear the Community Member Hat
  const isCommunityMember = useMemo(() => {
    if (!address || !wearerHats || !Array.isArray(wearerHats) || chainId !== 10) return false;
    return wearerHats.some((hat) => hat.id === CONFIG.agreementV0.communityHatId);
  }, [wearerHats, chainId, address]);

  // Combine all these conditions for beta features access
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
