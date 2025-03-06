'use client';

import { useBetaFeatures } from 'hats-hooks';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
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
  toggleBetaFeatures: () => {},
});

export const BetaFeaturesProvider = ({
  children,
  address,
  chainId,
}: {
  children: ReactNode;
  address: string | undefined;
  chainId: number;
}) => {
  const [showBetaFeatures, setShowBetaFeatures] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('showBetaFeatures') === 'true';
  });

  const validAddress = address && isAddress(address) ? (address as Hex) : undefined;
  const { isCommunityMember, betaFeaturesEnabled, canAccessBetaFeatures } = useBetaFeatures({
    address: validAddress,
    chainId,
  });

  const toggleBetaFeatures = useCallback(() => {
    if (!isCommunityMember) return;
    const newValue = !showBetaFeatures;
    setShowBetaFeatures(newValue);
    localStorage.setItem('showBetaFeatures', String(newValue));
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

export const useBetaFeaturesContext = () => {
  const context = useContext(BetaFeaturesContext);
  if (!context) {
    throw new Error('useBetaFeaturesContext must be used within a BetaFeaturesProvider');
  }
  return context;
};
