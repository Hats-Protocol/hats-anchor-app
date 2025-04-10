'use client';

import { useBetaFeatures } from 'hats-hooks';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { logger } from 'utils';
import { Hex, isAddress } from 'viem';

interface BetaFeaturesContextType {
  showBetaFeatures: boolean;
  isCommunityMember: boolean;
  betaFeaturesEnabled: boolean;
  canAccessBetaFeatures: boolean;
  toggleBetaFeatures: () => void;
}

const BetaFeaturesContext = createContext<BetaFeaturesContextType>({
  showBetaFeatures: false,
  isCommunityMember: false,
  betaFeaturesEnabled: false,
  canAccessBetaFeatures: false,
  toggleBetaFeatures: () => undefined,
});

export const BetaFeaturesProvider = ({ children, address }: { children: ReactNode; address: string | undefined }) => {
  const [showBetaFeatures, setShowBetaFeatures] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('showBetaFeatures') === 'true';
    } catch (error) {
      logger.warn('Failed to access localStorage:', error);
      return false;
    }
  });

  const validAddress = address && isAddress(address) ? (address as Hex) : undefined;

  const { isCommunityMember, betaFeaturesEnabled, canAccessBetaFeatures } = useBetaFeatures({
    address: validAddress,
  });

  const toggleBetaFeatures = useCallback(() => {
    if (!isCommunityMember) return;
    const newValue = !showBetaFeatures;
    setShowBetaFeatures(newValue);
    try {
      localStorage.setItem('showBetaFeatures', String(newValue));
    } catch (error) {
      logger.warn('Failed to store beta features preference:', error);
    }
  }, [isCommunityMember, showBetaFeatures]);

  const value = {
    showBetaFeatures,
    isCommunityMember,
    betaFeaturesEnabled,
    canAccessBetaFeatures,
    toggleBetaFeatures,
  };

  return <BetaFeaturesContext.Provider value={value}>{children}</BetaFeaturesContext.Provider>;
};

export const useBetaFeaturesContext = (): BetaFeaturesContextType => {
  const context = useContext(BetaFeaturesContext);
  if (!context) {
    throw new Error('useBetaFeaturesContext must be used within a BetaFeaturesProvider');
  }
  return context;
};
