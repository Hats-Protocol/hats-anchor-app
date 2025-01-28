'use client';

import { useTreeDetails } from 'hats-hooks';
import { useSafesInfo } from 'hooks';
import { filter, find, get, includes, map } from 'lodash';
import { useSignerSafes } from 'modules-hooks';
import { createContext, useContext, useMemo } from 'react';
import { AppHat, AppTree, HatSignerGate, SupportedChains } from 'types';
import { getAddress, Hex } from 'viem';

export interface TreasuryContextProps {
  chainId: SupportedChains | undefined;
  treeId: number | undefined;
  treeDetails: AppTree | undefined;
  hats: AppHat[] | undefined;
  safes: Hex[] | undefined;
  signerSafes: HatSignerGate[] | undefined;
  hatsWithSafesInfo: any | undefined;
}

export const TreasuryContext = createContext<TreasuryContextProps>({
  chainId: undefined,
  treeId: undefined,
  treeDetails: undefined,
  hats: undefined,
  safes: undefined,
  signerSafes: undefined,
  hatsWithSafesInfo: undefined,
});

export const TreasuryContextProvider = ({
  treeId,
  chainId,
  children,
}: {
  treeId: number;
  chainId: SupportedChains;
  children: React.ReactNode;
}) => {
  const { data: treeDetails } = useTreeDetails({
    treeId,
    chainId,
  });
  const hats = get(treeDetails, 'hats');
  const hatIds = map(hats, 'id');

  const { data: signerSafes } = useSignerSafes({
    hatIds,
    chainId,
  });
  const safes = useMemo(() => map(signerSafes, 'safe'), [signerSafes]);

  const { data: safeInfos } = useSafesInfo({
    chainId,
    safes: map(signerSafes, 'safe'),
  });

  const hatsWithSafesInfo = map(signerSafes, (signerSafe) => {
    const safeInfo = find(safeInfos, { address: getAddress(signerSafe.safe) });
    const signerHats = map(get(signerSafe, 'signerHats'), 'id');
    const localHats = filter(hats, (h: AppHat) => includes(signerHats, h.id));

    return {
      hats: localHats,
      hsgConfig: signerSafe,
      safeInfo,
    };
  });

  const value = useMemo(
    () => ({
      chainId,
      treeId,
      treeDetails: treeDetails || undefined,
      hats,
      safes,
      signerSafes: signerSafes || undefined,
      hatsWithSafesInfo,
    }),
    [chainId, treeId, treeDetails, hats, safes, signerSafes, hatsWithSafesInfo],
  );

  return <TreasuryContext.Provider value={value}>{children}</TreasuryContext.Provider>;
};

export const useTreasury = () => useContext(TreasuryContext);
