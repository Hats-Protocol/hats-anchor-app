import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { MODULE_TYPES } from 'app-constants';
import {
  useHatDetails,
  useHatDetailsField,
  useModuleDetails,
  useWearersControllersDetails,
} from 'hats-hooks';
import { AppHat, HatDetails, HatWearer, SupportedChains } from 'hats-types';
import _ from 'lodash';
import { createContext, useContext, useMemo } from 'react';
import { Hex } from 'viem';

export interface EligibilityContextProps {
  chainId: SupportedChains | undefined;
  selectedHat: AppHat | undefined;
  selectedHatDetails: HatDetails | undefined;
  wearersAndControllers: HatWearer[] | undefined;
  treeId: Hex;
  moduleDetails: Module;
  moduleParameters: ModuleParameter[];
  controllerAddress: Hex;
  isHatDetailsLoading: boolean;
  isModuleDetailsLoading: boolean;
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
    hats: [selectedHat],
  });

  const controllerAddress = _.get(
    selectedHat,
    _.toLower(MODULE_TYPES.eligibility),
  );

  const {
    details,
    parameters,
    isLoading: isModuleDetailsLoading,
  } = useModuleDetails({
    address: controllerAddress,
    chainId,
  });

  const value = useMemo(
    () => ({
      chainId,
      selectedHat,
      selectedHatDetails: hatDetails?.data,
      wearersAndControllers,
      treeId,
      moduleDetails: details,
      moduleParameters: parameters,
      controllerAddress,
      isHatDetailsLoading,
      isModuleDetailsLoading,
    }),
    [
      chainId,
      hatDetails,
      selectedHat,
      treeId,
      wearersAndControllers,
      details,
      parameters,
      controllerAddress,
      isHatDetailsLoading,
      isModuleDetailsLoading,
    ],
  );

  return (
    <EligibilityContext.Provider value={value}>
      {children}
    </EligibilityContext.Provider>
  );
};

export const useEligibility = () => useContext(EligibilityContext);
