'use client';

import { CONTROLLER_TYPES } from '@hatsprotocol/constants';
import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useHatDetails } from 'hats-hooks';
import { useImageURIs } from 'hooks';
import _ from 'lodash';
import { useAncillaryElection, useModuleDetails } from 'modules-hooks';
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

  const controllerAddress = _.get(
    selectedHat,
    _.toLower(CONTROLLER_TYPES.eligibility),
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

  const { data: electionsAuthority, isLoading: isElectionsAuthorityLoading } =
    useAncillaryElection({
      id: controllerAddress,
      chainId,
    });

  const value = useMemo(
    () => ({
      chainId,
      selectedHat: _.first(selectedHatWithImageUrl) || selectedHat,
      selectedHatDetails: hatDetails,
      moduleDetails,
      moduleParameters,
      controllerAddress,
      isModuleDetailsLoading,
      electionsAuthority,
      isElectionsAuthorityLoading,
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
    ],
  );

  return (
    <EligibilityContext.Provider value={value}>
      {children}
    </EligibilityContext.Provider>
  );
};

export const useEligibility = () => useContext(EligibilityContext);
