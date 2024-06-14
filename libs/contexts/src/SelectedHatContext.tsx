import {
  hatIdDecimalToIp,
  treeIdDecimalToHex,
} from '@hatsprotocol/sdk-v1-core';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import { useRouter } from 'next/router';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { createHierarchy } from 'shared';
import { AppHat, HatDetails, Hierarchy, SupportedChains } from 'types';
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
  treeId,
  chainId,
  hatId,
  children,
}: {
  treeId: number | undefined;
  chainId: SupportedChains;
  hatId: Hex | undefined;
  children: ReactNode;
}) => {
  const router = useRouter();
  const { flipped, compact } = _.pick(router.query, ['flipped', 'compact']);
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
  }, [orgChartTree, hatId]);
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
  );
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
        const basePath = router.basePath ? `${router.basePath}` : '';

        const urlToOpen = new URL(
          `${basePath}${hat.url}`,
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
