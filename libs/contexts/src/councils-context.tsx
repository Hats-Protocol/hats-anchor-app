'use client';

import { CONTROLLER_TYPES } from '@hatsprotocol/constants';
import { Ruleset } from '@hatsprotocol/modules-sdk';
import { useHatDetails, useTreeDetails } from 'hats-hooks';
import { useImageURIs } from 'hooks';
import { first, get, toLower, toNumber } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import { createContext, useContext, useMemo } from 'react';
import { AppHat, HatDetails, SupportedChains } from 'types';
import { Hex } from 'viem';

export interface CouncilsContextProps {
  council: string | undefined;
  chain: string | undefined;
  // chainId: SupportedChains | undefined;
  // selectedHat: AppHat | null | undefined;
  // selectedHatDetails: HatDetails | undefined;
  // eligibilityRules: Ruleset[] | null | undefined;
  // controllerAddress: Hex | undefined;
}

const identifyCouncil = (identifier?: string) => {
  if (identifier?.includes('%3A')) {
    const [chain, council] = identifier.split('%3A');
    return {
      council,
      chain,
    };
  }

  // TODO lookup council by slug

  return {
    council: undefined,
    chain: undefined,
  };
};

export const CouncilsContext = createContext<CouncilsContextProps>({
  council: '',
  chain: '',
});

export const CouncilsContextProvider = ({
  identifier,
  children,
}: {
  identifier: string;
  children: React.ReactNode;
}) => {
  console.log('identifier', identifier);

  const { council, chain } = identifyCouncil(identifier);

  const hatId = undefined;
  const chainId = 11155111;

  // const [isEligible, setIsEligible] = useState(false);
  // const { data: selectedHat, details: hatDetails } = useHatDetails({
  //   chainId,
  //   hatId,
  // });
  // const treeId = toNumber(get(selectedHat, 'tree.id'));
  const requireHatter = false;
  // const { data: treeDetails } = useTreeDetails({
  //   treeId,
  //   chainId,
  // });

  // const controllerAddress = get(
  //   selectedHat,
  //   toLower(CONTROLLER_TYPES.eligibility),
  // );

  // const { data: selectedHatWithImageUrl } = useImageURIs({
  //   hats: selectedHat ? [selectedHat] : [],
  // });

  // const { data: eligibilityRules } = useEligibilityRules({
  //   address: controllerAddress,
  //   chainId,
  // });

  const value = useMemo(
    () => ({
      council,
      chain,
    }),
    [council, chain],
  );

  return (
    <CouncilsContext.Provider value={value}>
      {children}
    </CouncilsContext.Provider>
  );
};

export const useCouncils = () => useContext(CouncilsContext);
