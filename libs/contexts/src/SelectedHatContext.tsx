'use client';

import {
  hatIdDecimalToHex,
  hatIdDecimalToIp,
  hatIdIpToDecimal,
  treeIdDecimalToHex,
} from '@hatsprotocol/sdk-v1-core';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { createHierarchy } from 'shared';
import { AppHat, HatDetails, Hierarchy, SupportedChains } from 'types';
import { getPathParams } from 'utils';
import { Hex } from 'viem';

import { useTreeForm } from './TreeFormContext';

export interface SelectedHatContext {
  // SELECTED HAT
  selectedHat: AppHat | undefined;
  selectedHatDetails: HatDetails | undefined;
  chainId: SupportedChains | undefined;
  hatLoading: boolean;
  isClaimable?: { by: boolean; for: boolean } | undefined;
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
  chainId: undefined,
  hatLoading: false,
  isClaimable: undefined,
  // ONCHAIN HAT
  isDraft: false,
  selectedOnchainHat: undefined,
  selectedOnchainHatDetails: undefined,
  // ACTIONS
  handleSelectHat: undefined,
  // RELATIONS
  hierarchy: undefined,
});

export const SelectedHatContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const params = useSearchParams();
  const pathname = usePathname();
  const { hatId: hatIdPathParam, treeId, chainId } = getPathParams(pathname);

  const hatIdQueryParam = params.get('hatId');
  const hatId =
    hatIdPathParam ||
    (hatIdQueryParam
      ? hatIdDecimalToHex(hatIdIpToDecimal(hatIdQueryParam))
      : undefined);

  const flipped = params.get('flipped');
  const compact = params.get('compact');
  const {
    onchainHats,
    onchainTree,
    orgChartTree,
    onCloseTreeDrawer,
    onOpenHatDrawer,
  } = useTreeForm();
  const { isMobile } = useMediaStyles();

  // *********************
  // * SELECTED HAT
  // *********************
  const selectedHat = useMemo(() => {
    return _.find(orgChartTree, { id: hatId });
  }, [orgChartTree, hatId]) as AppHat | undefined;
  const selectedHatDetails = useMemo(
    () => _.get(selectedHat, 'detailsObject.data'),
    [selectedHat],
  );
  const isDraft = useMemo(
    () => !_.includes(_.map(onchainHats, 'id'), selectedHat?.id),
    [onchainHats, selectedHat],
  );

  // *********************
  // * ONCHAIN HAT
  // *********************
  const selectedOnchainHat = useMemo(
    () => _.find(onchainTree, { id: hatId }),
    [onchainTree, hatId],
  ) as AppHat | undefined;
  const selectedOnchainHatDetails = useMemo(
    () => _.get(selectedOnchainHat, 'detailsObject.data'),
    [selectedOnchainHat],
  );

  const isClaimable = useMemo(
    () =>
      selectedHat
        ? {
            by: !_.isEmpty(selectedHat?.claimableBy),
            for: !_.isEmpty(selectedHat?.claimableForBy),
          }
        : undefined,
    [selectedHat],
  );
  const hierarchy = useMemo(() => {
    const parentsAndIds = _.map(orgChartTree, (hat: AppHat) => ({
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

      const allIds = _.map(orgChartTree, 'id');
      const hat = _.find(orgChartTree, ['id', id]);
      if (!_.includes(allIds, id) || !hat) return;

      // if it's linked
      if (hat.treeId && treeId && hat.treeId !== treeIdDecimalToHex(treeId)) {
        const hatIdParam = hatIdDecimalToIp(BigInt(hat.id));

        const urlToOpen = new URL(
          `${BASE_PATH}${hat.url}`,
          window.location.origin,
        );
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
      chainId,
      hatLoading: !selectedHat || !selectedHatDetails,
      isClaimable,
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
      // SELECTED HAT
      selectedHat,
      selectedHatDetails,
      chainId,
      isClaimable,
      // ONCHAIN HAT
      isDraft,
      selectedOnchainHat,
      selectedOnchainHatDetails,
      // ACTIONS
      handleSelectHat,
      // RELATIONS
      hierarchy,
    ],
  );

  return (
    <SelectedHatContext.Provider value={returnValue}>
      {children}
    </SelectedHatContext.Provider>
  );
};

export const useSelectedHat = () => useContext(SelectedHatContext);
