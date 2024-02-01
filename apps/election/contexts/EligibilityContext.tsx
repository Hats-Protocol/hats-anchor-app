import {
  useHatDetails,
  useHatDetailsField,
  useWearersControllersDetails,
} from 'hats-hooks';
import { AppHat, HatDetails, HatWearer, SupportedChains } from 'hats-types';
import { createContext, useContext, useMemo } from 'react';
import { Hex } from 'viem';

export interface EligibilityContextProps {
  chainId: SupportedChains | undefined;
  selectedHat: AppHat | undefined;
  selectedHatDetails: HatDetails | undefined;
  wearersAndControllers: HatWearer[] | undefined;
  treeId: Hex;
}

export const EligibilityContext = createContext<EligibilityContextProps>({
  chainId: undefined,
  selectedHat: undefined,
  selectedHatDetails: undefined,
  wearersAndControllers: undefined,
  treeId: undefined,
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

  const { data: hatDetails } = useHatDetailsField(selectedHat?.details);

  const wearersAndControllers = useWearersControllersDetails({
    hats: [selectedHat],
  });

  // get all module resolution in here as well

  const value = useMemo(
    () => ({
      chainId,
      selectedHat,
      selectedHatDetails: hatDetails?.data,
      wearersAndControllers,
      treeId,
    }),
    [chainId, hatDetails, selectedHat, treeId, wearersAndControllers],
  );

  return (
    <EligibilityContext.Provider value={value}>
      {children}
    </EligibilityContext.Provider>
  );
};

export const useEligibility = () => useContext(EligibilityContext);
