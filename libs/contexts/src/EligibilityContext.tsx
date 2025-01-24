'use client';

import { CONTROLLER_TYPES } from '@hatsprotocol/constants';
import { Ruleset } from '@hatsprotocol/modules-sdk';
import { HATS_ABI, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails, useTreeDetails } from 'hats-hooks';
import { useImageURIs } from 'hooks';
import { first, flatten, get, includes, toLower, toNumber } from 'lodash';
import { useCurrentEligibility, useEligibilityRules, useMultiClaimsHatterCheck } from 'modules-hooks';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppHat, EligibilityRule, HatDetails, SupportedChains, WearerStatus } from 'types';
import { Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

export interface EligibilityContextProps {
  chainId: SupportedChains | undefined;
  selectedHat: AppHat | null | undefined;
  selectedHatDetails: HatDetails | undefined;
  eligibilityRules: Ruleset[] | undefined;
  controllerAddress: Hex | undefined;
  currentEligibility: { [key: Hex]: WearerStatus } | undefined;
  isWearing: boolean;
  // loading
  isHatDetailsLoading: boolean | undefined;
  isEligibilityRulesLoading: boolean | undefined;
  // claiming
  isClaimableFor: boolean;
  hatterIsAdmin: boolean | undefined;
  requireHatter: boolean;
  // current active rule
  activeRule: EligibilityRule | undefined;
  setActiveRule: (rule: EligibilityRule | undefined) => void;
  // in-app eligibility
  isReadyToClaim: { [key: Hex]: boolean } | undefined;
  setIsReadyToClaim: (address: Hex) => void;
}

export const EligibilityContext = createContext<EligibilityContextProps>({
  chainId: undefined,
  selectedHat: undefined,
  selectedHatDetails: undefined,
  eligibilityRules: undefined,
  controllerAddress: undefined,
  currentEligibility: undefined,
  isWearing: false,
  // loading
  isHatDetailsLoading: true,
  isEligibilityRulesLoading: true,
  // claiming
  isClaimableFor: false,
  hatterIsAdmin: false,
  requireHatter: false,
  // current active rule
  activeRule: undefined,
  setActiveRule: (rule: EligibilityRule | undefined) => {},
  // in-app eligibility
  isReadyToClaim: {},
  setIsReadyToClaim: (address: Hex) => {},
});

export const EligibilityContextProvider = ({
  hatId,
  chainId,
  children,
}: {
  hatId: Hex;
  chainId: SupportedChains;
  children: React.ReactNode;
}) => {
  const [isReadyToClaim, rawSetIsReadyToClaim] = useState({});
  const [activeRule, setActiveRule] = useState<EligibilityRule | undefined>();
  const {
    data: selectedHat,
    details: hatDetails,
    isLoading: isHatDetailsLoading,
  } = useHatDetails({
    chainId,
    hatId,
  });
  const treeId = toNumber(get(selectedHat, 'tree.id'));
  const requireHatter = true;
  const { data: treeDetails } = useTreeDetails({
    treeId,
    chainId,
  });
  const { address } = useAccount();

  const controllerAddress = get(selectedHat, toLower(CONTROLLER_TYPES.eligibility));

  const { data: selectedHatWithImageUrl, isLoading: isImageURIsLoading } = useImageURIs({
    hats: selectedHat ? [selectedHat] : [],
  });

  const { data: eligibilityRules, isLoading: isEligibilityRulesLoading } = useEligibilityRules({
    chainId,
    address: controllerAddress,
  });

  const { data: currentEligibility } = useCurrentEligibility({
    chainId,
    wearerAddress: address as Hex,
    eligibilityRules: eligibilityRules || undefined,
    selectedHat,
  });

  const { data: balanceOf } = useReadContract({
    address: HATS_V1,
    abi: HATS_ABI,
    functionName: 'balanceOf',
    args: [address as Hex, selectedHat?.id ? BigInt(selectedHat?.id) : BigInt(0)],
  });
  const isWearing = balanceOf ? balanceOf > BigInt(0) : false;

  const { claimableForHats, hatterIsAdmin } = useMultiClaimsHatterCheck({
    selectedHat,
    chainId,
    onchainHats: get(treeDetails, 'hats', []),
  });
  const isClaimableFor = useMemo(() => includes(claimableForHats, selectedHat?.id), [claimableForHats, selectedHat]);

  const setIsReadyToClaim = useCallback(
    (address: Hex) => {
      rawSetIsReadyToClaim({ ...isReadyToClaim, [address]: true }); // TODO handle toggle?
    },
    [rawSetIsReadyToClaim, isReadyToClaim],
  );

  useEffect(() => {
    if (activeRule) return;

    setActiveRule(first(flatten(eligibilityRules)));
  }, [eligibilityRules, activeRule]);

  const value = useMemo(
    () => ({
      chainId,
      selectedHat: first(selectedHatWithImageUrl) || selectedHat,
      selectedHatDetails: hatDetails,
      eligibilityRules: eligibilityRules || undefined,
      controllerAddress,
      currentEligibility: currentEligibility || undefined,
      isWearing,
      // loading
      isHatDetailsLoading: isHatDetailsLoading || isImageURIsLoading,
      isEligibilityRulesLoading,
      // claiming
      isClaimableFor,
      hatterIsAdmin,
      requireHatter,
      // current active rule
      activeRule,
      setActiveRule,
      // in-app eligibility
      isReadyToClaim,
      setIsReadyToClaim,
    }),
    [
      chainId,
      hatDetails,
      selectedHatWithImageUrl,
      selectedHat,
      eligibilityRules,
      controllerAddress,
      currentEligibility,
      isWearing,
      // loading
      isHatDetailsLoading,
      isImageURIsLoading,
      isEligibilityRulesLoading,
      // claiming
      isClaimableFor,
      hatterIsAdmin,
      requireHatter,
      // current active rule
      activeRule,
      setActiveRule,
      // in-app eligibility
      isReadyToClaim,
      setIsReadyToClaim,
    ],
  );

  return <EligibilityContext.Provider value={value}>{children}</EligibilityContext.Provider>;
};

export const useEligibility = () => useContext(EligibilityContext);
