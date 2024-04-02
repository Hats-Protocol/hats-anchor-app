import { MODULE_TYPES } from '@hatsprotocol/constants';
import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import {
  useAncillaryElection,
  useHatDetails,
  useHatDetailsField,
  useModuleDetails,
  useWearersControllersDetails,
} from 'hats-hooks';
import { useImageURIs } from 'hooks';
import _ from 'lodash';
import { createContext, useContext, useMemo } from 'react';
import { AppHat, HatDetails, HatWearer, SupportedChains } from 'types';
import { Hex } from 'viem';

export interface EligibilityContextProps {
  chainId: SupportedChains | undefined;
  selectedHat: AppHat | null | undefined;
  selectedHatDetails: HatDetails | undefined;
  wearersAndControllers: HatWearer[] | undefined;
  treeId: Hex | undefined;
  moduleDetails: Module | undefined;
  moduleParameters: ModuleParameter[] | undefined;
  controllerAddress: Hex | undefined;
  isHatDetailsLoading: boolean | undefined;
  isModuleDetailsLoading: boolean | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  electionsAuthority: any | undefined;
  isElectionsAuthorityLoading: boolean;
}

export const EligibilityContext = createContext<EligibilityContextProps>({
  chainId: undefined,
  selectedHat: undefined,
  selectedHatDetails: undefined,
  wearersAndControllers: undefined,
  treeId: undefined,
  moduleDetails: undefined,
  moduleParameters: undefined,
  controllerAddress: undefined,
  isHatDetailsLoading: false,
  isModuleDetailsLoading: false,
  electionsAuthority: undefined,
  isElectionsAuthorityLoading: false,
});

export const EligibilityContextProvider = ({
  hatId,
  treeId,
  chainId,
  children,
}: {
  hatId: Hex;
  treeId: Hex;
  chainId: SupportedChains;
  children: React.ReactNode;
}) => {
  const { data: selectedHat } = useHatDetails({
    chainId,
    hatId,
  });

  const { data: hatDetails, isLoading: isHatDetailsLoading } =
    useHatDetailsField(selectedHat?.details);

  const wearersAndControllers = useWearersControllersDetails({
    hats: selectedHat ? [selectedHat] : [],
  });

  const controllerAddress = _.get(
    selectedHat,
    _.toLower(MODULE_TYPES.eligibility),
  );

  const { data: selectedHatWithImageUrl } = useImageURIs({
    hats: selectedHat ? [selectedHat] : [],
  });

  const {
    details,
    parameters,
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
      selectedHatDetails: hatDetails?.data,
      wearersAndControllers,
      treeId,
      moduleDetails: details,
      moduleParameters: parameters,
      controllerAddress,
      isHatDetailsLoading,
      isModuleDetailsLoading,
      electionsAuthority,
      isElectionsAuthorityLoading,
    }),
    [
      chainId,
      hatDetails,
      selectedHatWithImageUrl,
      selectedHat,
      treeId,
      wearersAndControllers,
      details,
      parameters,
      controllerAddress,
      isHatDetailsLoading,
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
