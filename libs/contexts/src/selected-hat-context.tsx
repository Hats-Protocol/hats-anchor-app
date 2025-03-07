'use client';

import { Ruleset } from '@hatsprotocol/modules-sdk';
import {
  FALLBACK_ADDRESS,
  hatIdDecimalToHex,
  hatIdDecimalToIp,
  hatIdIpToDecimal,
  treeIdDecimalToHex,
} from '@hatsprotocol/sdk-v1-core';
import { useMediaStyles } from 'hooks';
import { find, get, includes, isEmpty, map } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import { usePathname, useSearchParams } from 'next/navigation';
import { createContext, ReactNode, Suspense, useCallback, useContext, useMemo } from 'react';
import { createHierarchy } from 'shared';
import { AppHat, HatDetails, Hierarchy, SupportedChains } from 'types';
import { getPathParams } from 'utils';
import { Hex } from 'viem';

import { useTreeForm } from './tree-form-context';

export interface SelectedHatContext {
  // SELECTED HAT
  selectedHat: AppHat | undefined;
  selectedHatDetails: HatDetails | undefined;
  eligibilityInfo: Ruleset[] | undefined;
  toggleInfo: Ruleset[] | undefined;
  chainId: SupportedChains | undefined;
  hatLoading: boolean;
  isClaimable?: { by: boolean; for: boolean } | undefined;
  hatNotInTree: boolean;
  // ONCHAIN HAT
  isDraft: boolean;
  selectedOnchainHat: AppHat | undefined;
  selectedOnchainHatDetails: HatDetails | undefined;
  // ACTIONS
  handleSelectHat: ((id: Hex) => void) | undefined;
  // RELATIONS
  hierarchy: Hierarchy | undefined;
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const SelectedHatContext = createContext<SelectedHatContext>({
  // SELECTED HAT
  selectedHat: undefined,
  selectedHatDetails: undefined,
  eligibilityInfo: undefined,
  toggleInfo: undefined,
  chainId: undefined,
  hatLoading: false,
  isClaimable: undefined,
  hatNotInTree: false,
  // ONCHAIN HAT
  isDraft: false,
  selectedOnchainHat: undefined,
  selectedOnchainHatDetails: undefined,
  // ACTIONS
  handleSelectHat: undefined,
  // RELATIONS
  hierarchy: undefined,
});

const SelectedHatContextContent = ({ children }: { children: ReactNode }) => {
  const params = useSearchParams();
  const pathname = usePathname();
  const { hatId: hatIdPathParam, treeId, chainId } = getPathParams(pathname);

  const hatIdQueryParam = params.get('hatId');
  const hatId = hatIdPathParam || (hatIdQueryParam ? hatIdDecimalToHex(hatIdIpToDecimal(hatIdQueryParam)) : undefined);

  const flipped = params.get('flipped');
  const compact = params.get('compact');
  const { onchainHats, onchainTree, orgChartTree, onCloseTreeDrawer, onOpenHatDrawer } = useTreeForm();
  const { isMobile } = useMediaStyles();

  // *********************
  // * SELECTED HAT
  // *********************
  const selectedHat = useMemo(() => {
    return find(orgChartTree, { id: hatId });
  }, [orgChartTree, hatId]) as AppHat | undefined;
  const selectedHatDetails = useMemo(() => get(selectedHat, 'detailsObject.data'), [selectedHat]);
  const isDraft = useMemo(() => !includes(map(onchainHats, 'id'), selectedHat?.id), [onchainHats, selectedHat]);
  const hatNotInTree = useMemo(() => !includes(map(orgChartTree, 'id'), selectedHat?.id), [orgChartTree, selectedHat]);

  const { data: eligibilityInfo, isLoading: eligibilityLoading } = useEligibilityRules({
    address: selectedHat?.eligibility,
    chainId,
    enabled: !!selectedHat?.eligibility && selectedHat?.eligibility !== FALLBACK_ADDRESS,
  });
  const { data: toggleInfo, isLoading: toggleLoading } = useEligibilityRules({
    address: selectedHat?.toggle,
    chainId,
    enabled: !!selectedHat?.toggle && selectedHat?.toggle !== FALLBACK_ADDRESS,
  });

  // *********************
  // * ONCHAIN HAT
  // *********************
  const selectedOnchainHat = useMemo(() => find(onchainTree, { id: hatId }), [onchainTree, hatId]) as
    | AppHat
    | undefined;
  const selectedOnchainHatDetails = useMemo(() => get(selectedOnchainHat, 'detailsObject.data'), [selectedOnchainHat]);

  const isClaimable = useMemo(
    () =>
      selectedHat
        ? {
            by: !isEmpty(selectedHat?.claimableBy),
            for: !isEmpty(selectedHat?.claimableForBy),
          }
        : undefined,
    [selectedHat],
  );
  const hierarchy = useMemo(() => {
    const parentsAndIds = map(orgChartTree, (hat: AppHat) => ({
      id: hat.id,
      parentId: hat.admin?.id,
    }));
    return createHierarchy(parentsAndIds, selectedHat?.id);
  }, [orgChartTree, selectedHat]);

  // *********************
  // * HAT ACTIONS
  // *********************
  const handleSelectHat = useCallback(
    (id: Hex) => {
      if (isMobile) return;

      const allIds = map(orgChartTree, 'id');
      const hat = find(orgChartTree, ['id', id]);
      if (!includes(allIds, id) || !hat) return;

      // if it's linked
      if (hat.treeId && treeId && hat.treeId !== treeIdDecimalToHex(treeId)) {
        const hatIdParam = hatIdDecimalToIp(BigInt(hat.id));

        const urlToOpen = new URL(`${BASE_PATH}${hat.url}`, window.location.origin);
        urlToOpen.searchParams.append('hatId', hatIdParam);
        window.open(urlToOpen.toString(), '_blank')?.focus();
        return;
      }

      onCloseTreeDrawer?.();
      onOpenHatDrawer?.(id);
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgChartTree, isMobile, flipped, compact, chainId],
  );

  const returnValue = useMemo(
    () => ({
      // SELECTED HAT
      selectedHat,
      selectedHatDetails,
      eligibilityInfo: eligibilityInfo || undefined,
      toggleInfo: toggleInfo || undefined,
      chainId,
      hatLoading: !selectedHat || !selectedHatDetails || eligibilityLoading || toggleLoading,
      isClaimable,
      hatNotInTree,
      // ONCHAIN HAT
      isDraft,
      selectedOnchainHat,
      selectedOnchainHatDetails,
      // ACTIONS
      handleSelectHat,
      // RELATIONS
      hierarchy,
    }),
    [
      selectedHat,
      selectedHatDetails,
      eligibilityInfo,
      toggleInfo,
      chainId,
      eligibilityLoading,
      toggleLoading,
      isClaimable,
      hatNotInTree,
      // ONCHAIN HAT
      isDraft,
      selectedOnchainHat,
      selectedOnchainHatDetails,
      handleSelectHat,
      hierarchy,
    ],
  );

  return <SelectedHatContext.Provider value={returnValue}>{children}</SelectedHatContext.Provider>;
};

export const SelectedHatContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense
      fallback={<SelectedHatContext.Provider value={{} as SelectedHatContext}>{children}</SelectedHatContext.Provider>}
    >
      <SelectedHatContextContent>{children}</SelectedHatContextContent>
    </Suspense>
  );
};

export const useSelectedHat = () => useContext(SelectedHatContext);
