'use client';

import { useEligibility } from 'contexts';
import { SupportedChains } from 'types';

import { HatDevDetails } from './hat-dev-details';

// Intentionally light component that wraps the HatDevDetails component and passes values
// from the useEligibility context used in the Claims app

const HatDevDetailsClaims = () => {
  const { selectedHat, chainId, eligibilityRules, isClaimableFor } = useEligibility();

  return (
    <HatDevDetails
      selectedHat={selectedHat || undefined}
      chainId={chainId as SupportedChains}
      eligibilityInfo={eligibilityRules}
      isClaimable={{ for: isClaimableFor, by: false }} // ignoring by for now since not eligible with MCH
    />
  );
};

export { HatDevDetailsClaims };
