'use client';

import { CONTROLLER_TYPES } from '@hatsprotocol/constants';
import { Ruleset } from '@hatsprotocol/modules-sdk';
import { useHatDetails, useTreeDetails } from 'hats-hooks';
import { useImageURIs } from 'hooks';
import { first, get, includes, toLower, toNumber } from 'lodash';
import {
  useCurrentEligibility,
  useEligibilityRules,
  useMultiClaimsHatterCheck,
} from 'modules-hooks';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { AppHat, HatDetails, SupportedChains, WearerStatus } from 'types';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

export interface EligibilityContextProps {
  chainId: SupportedChains | undefined;
  selectedHat: AppHat | null | undefined;
  selectedHatDetails: HatDetails | undefined;
  eligibilityRules: Ruleset[] | undefined;
  controllerAddress: Hex | undefined;
  currentEligibility: { [key: Hex]: WearerStatus } | undefined;
  // loading
  isHatDetailsLoading: boolean | undefined;
  isEligibilityRulesLoading: boolean | undefined;
  // claiming
  isClaimableFor: boolean;
  hatterIsAdmin: boolean | undefined;
  requireHatter: boolean;
  // temporary eligibility
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
  // loading
  isHatDetailsLoading: true,
  isEligibilityRulesLoading: true,
  // claiming
  isClaimableFor: false,
  hatterIsAdmin: false,
  requireHatter: false,
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
  const {
    data: selectedHat,
    details: hatDetails,
    isLoading: isHatDetailsLoading,
  } = useHatDetails({
    chainId,
    hatId,
  });
  const treeId = toNumber(get(selectedHat, 'tree.id'));
  const requireHatter = false;
  const { data: treeDetails } = useTreeDetails({
    treeId,
    chainId,
  });
  const { address } = useAccount();

  const controllerAddress = get(
    selectedHat,
    toLower(CONTROLLER_TYPES.eligibility),
  );

  const { data: selectedHatWithImageUrl, isLoading: isImageURIsLoading } =
    useImageURIs({
      hats: selectedHat ? [selectedHat] : [],
    });

  const { data: eligibilityRules, isLoading: isEligibilityRulesLoading } =
    useEligibilityRules({
      chainId,
      address: controllerAddress,
    });

  const { data: currentEligibility } = useCurrentEligibility({
    chainId,
    wearerAddress: address as Hex,
    eligibilityRules: eligibilityRules || undefined,
    selectedHat,
  });

  const { claimableForHats, hatterIsAdmin } = useMultiClaimsHatterCheck({
    selectedHat,
    chainId,
    onchainHats: get(treeDetails, 'hats', []),
  });
  const isClaimableFor = useMemo(
    () => includes(claimableForHats, selectedHat?.id),
    [claimableForHats, selectedHat],
  );

  const setIsReadyToClaim = useCallback(
    (address: Hex) => {
      rawSetIsReadyToClaim({ ...isReadyToClaim, [address]: true }); // TODO handle toggle?
    },
    [rawSetIsReadyToClaim, isReadyToClaim],
  );

  const value = useMemo(
    () => ({
      chainId,
      selectedHat: first(selectedHatWithImageUrl) || selectedHat,
      selectedHatDetails: hatDetails,
      eligibilityRules: eligibilityRules || undefined,
      controllerAddress,
      currentEligibility: currentEligibility || undefined,
      // loading
      isHatDetailsLoading: isHatDetailsLoading || isImageURIsLoading,
      isEligibilityRulesLoading,
      // claiming
      isClaimableFor,
      hatterIsAdmin,
      requireHatter,
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
      // loading
      isHatDetailsLoading,
      isImageURIsLoading,
      isEligibilityRulesLoading,
      // claiming
      isClaimableFor,
      hatterIsAdmin,
      requireHatter,
      // in-app eligibility
      isReadyToClaim,
      setIsReadyToClaim,
    ],
  );

  return (
    <EligibilityContext.Provider value={value}>
      {children}
    </EligibilityContext.Provider>
  );
};

export const useEligibility = () => useContext(EligibilityContext);
