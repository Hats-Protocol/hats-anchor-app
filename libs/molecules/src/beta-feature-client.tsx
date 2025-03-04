'use client';

import { useBetaFeaturesContext } from 'contexts';
import { ReactNode } from 'react';

interface BetaFeatureClientProps {
  children: ReactNode;
}

export function BetaFeatureClient({ children }: BetaFeatureClientProps) {
  const { isCommunityMember, betaFeaturesEnabled, showBetaFeatures } = useBetaFeaturesContext();

  const canAccess = isCommunityMember && betaFeaturesEnabled && showBetaFeatures;

  if (!canAccess) {
    return null;
  }

  return <>{children}</>;
}
