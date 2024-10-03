'use client';

import { CONTROLLER_TYPES, ELIGIBILITY_MODULES } from '@hatsprotocol/constants';
import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useHatDetails, useTreeDetails } from 'hats-hooks';
import { useImageURIs } from 'hooks';
import { first, get, includes, map, toLower, toNumber } from 'lodash';
import {
  useAncillaryElection,
  useModuleDetails,
  useMultiClaimsHatterCheck,
} from 'modules-hooks';
import { createContext, useContext, useMemo } from 'react';
import { AppHat, HatDetails, SupportedChains } from 'types';
import { Hex } from 'viem';

export interface EligibilityContextProps {
  chainId: SupportedChains | undefined;
  selectedHat: AppHat | null | undefined;
  selectedHatDetails: HatDetails | undefined;
  moduleDetails: Module | undefined;
  moduleParameters: ModuleParameter[] | undefined;
  controllerAddress: Hex | undefined;
  isModuleDetailsLoading: boolean | undefined;
  electionsAuthority: any | undefined;
  isElectionsAuthorityLoading: boolean;
  isClaimableFor: boolean;
}

export const EligibilityContext = createContext<EligibilityContextProps>({
  chainId: undefined,
  selectedHat: undefined,
  selectedHatDetails: undefined,
  moduleDetails: undefined,
  moduleParameters: undefined,
  controllerAddress: undefined,
  isModuleDetailsLoading: false,
  electionsAuthority: undefined,
  isElectionsAuthorityLoading: false,
  isClaimableFor: false,
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
  const { data: selectedHat, details: hatDetails } = useHatDetails({
    chainId,
    hatId,
  });
  const treeId = toNumber(get(selectedHat, 'treeId'));

  const { data: treeDetails } = useTreeDetails({
    treeId,
    chainId,
  });

  const controllerAddress = get(
    selectedHat,
    toLower(CONTROLLER_TYPES.eligibility),
  );

  const { data: selectedHatWithImageUrl } = useImageURIs({
    hats: selectedHat ? [selectedHat] : [],
  });

  const {
    details: moduleDetails,
    parameters: moduleParameters,
    isLoading: isModuleDetailsLoading,
  } = useModuleDetails({
    address: controllerAddress,
    chainId,
  });

  const { claimableForHats } = useMultiClaimsHatterCheck({
    selectedHat,
    chainId,
    onchainHats: get(treeDetails, 'hats', []),
  });
  const isClaimableFor = useMemo(
    () => includes(map(claimableForHats, 'id'), selectedHat?.id),
    [claimableForHats, selectedHat],
  );

  const { data: electionsAuthority, isLoading: isElectionsAuthorityLoading } =
    useAncillaryElection({
      id: controllerAddress,
      chainId,
      enabled: moduleDetails?.name === ELIGIBILITY_MODULES.election,
    });

  const value = useMemo(
    () => ({
      chainId,
      selectedHat: first(selectedHatWithImageUrl) || selectedHat,
      selectedHatDetails: hatDetails,
      moduleDetails,
      moduleParameters,
      controllerAddress,
      isModuleDetailsLoading,
      electionsAuthority,
      isElectionsAuthorityLoading,
      isClaimableFor,
    }),
    [
      chainId,
      hatDetails,
      selectedHatWithImageUrl,
      selectedHat,
      moduleDetails,
      moduleParameters,
      controllerAddress,
      isModuleDetailsLoading,
      electionsAuthority,
      isElectionsAuthorityLoading,
      isClaimableFor,
    ],
  );

  return (
    <EligibilityContext.Provider value={value}>
      {children}
    </EligibilityContext.Provider>
  );
};

export const useEligibility = () => useContext(EligibilityContext);
