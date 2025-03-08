'use client';

import { useBetaFeaturesContext } from 'contexts';
import { ReactNode, Suspense } from 'react';

interface BetaFeatureClientProps {
  children: ReactNode;
}

const BetaFeatureContent = ({ children }: { children: ReactNode }) => {
  const { isCommunityMember, betaFeaturesEnabled, showBetaFeatures } = useBetaFeaturesContext();

  const canAccess = isCommunityMember && betaFeaturesEnabled && showBetaFeatures;

  if (!canAccess) {
    return null;
  }

  return <>{children}</>;
};

export function BetaFeatureClient({ children }: BetaFeatureClientProps) {
  return (
    <Suspense fallback={null}>
      <BetaFeatureContent>{children}</BetaFeatureContent>
    </Suspense>
  );
}
