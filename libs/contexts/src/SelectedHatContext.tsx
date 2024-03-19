import {
  hatIdDecimalToIp,
  treeIdHexToDecimal,
} from '@hatsprotocol/sdk-v1-core';
// import { useQueryClient } from '@tanstack/react-query';
import {
  useAncillaryModules,
  useHatDetails,
  useHatWearers,
  useWearersEligibilityCheck,
} from 'hats-hooks';
import { combineAuthorities } from 'hats-utils';
import {
  useGuilds,
  useMediaStyles,
  useSnapshotSpaces as useSpaces,
} from 'hooks';
import _ from 'lodash';
import { useRouter } from 'next/router';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { createHierarchy, ipToHatId } from 'shared';
import {
  AppHat,
  Authority,
  HatDetails,
  HatWearer,
  Hierarchy,
  SupportedChains,
} from 'types';
import { Hex } from 'viem';

import { useOverlay } from './OverlayContext';
import { useTreeForm } from './TreeFormContext';

export interface SelectedHatContext {
  // SELECTED HAT
  selectedHat: AppHat | undefined;
  selectedHatDetails: HatDetails | undefined;
  hatWearers: HatWearer[] | undefined;
  eligibleWearers: HatWearer[] | undefined;
  ineligibleWearers: HatWearer[] | undefined;
  chainId: SupportedChains | undefined;
  hatLoading: boolean;
  wearersLoading: boolean;
  // ONCHAIN HAT
  isDraft: boolean;
  selectedOnchainHat: AppHat | undefined;
  selectedOnchainHatDetails: HatDetails | undefined;
  // AUTHORITIES
  selectedHatGuildRoles: Authority[] | undefined;
  selectedHatSpaces: Authority[] | undefined;
  combinedAuthorities: Authority[] | undefined;
  // ACTIONS
  handleSelectHat: ((id: Hex) => void) | undefined;
  // RELATIONS
  hierarchy: Hierarchy | undefined;
}

export const SelectedHatContext = createContext<SelectedHatContext>({
  // SELECTED HAT
  selectedHat: undefined,
  selectedHatDetails: undefined,
  hatWearers: undefined,
  eligibleWearers: undefined,
  ineligibleWearers: undefined,
  chainId: undefined,
  hatLoading: false,
  wearersLoading: false,
  // ONCHAIN HAT
  isDraft: false,
  selectedOnchainHat: undefined,
  selectedOnchainHatDetails: undefined,
  // AUTHORITIES
  selectedHatGuildRoles: undefined,
  selectedHatSpaces: undefined,
  combinedAuthorities: undefined,
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
  treeId: Hex;
  chainId: SupportedChains;
  hatId?: string | undefined;
  children: ReactNode;
}) => {
  const router = useRouter();
  // const queryClient = useQueryClient();
  const {
    onCloseTreeDrawer,
    onOpenHatDrawer,
    isHatDrawerOpen,
    onCloseHatDrawer,
  } = useOverlay();
  const { hatId: initialHatIdParam } = router.query;
  let initialHatId: string | undefined;
  const { flipped, compact } = _.pick(router.query, ['flipped', 'compact']);
  if (_.isArray(initialHatIdParam)) {
    initialHatId = _.first(initialHatId);
  } else {
    initialHatId = initialHatIdParam as string;
  }
  const selectedHatId = ipToHatId(initialHatId as string) || undefined;
  const { editMode, topHatDetails, onchainHats, onchainTree, orgChartTree } =
    useTreeForm();
  const { isMobile } = useMediaStyles();

  // *********************
  // * SELECTED HAT
  // *********************
  const selectedHat = useMemo(() => {
    return _.find(orgChartTree, { id: selectedHatId });
  }, [orgChartTree, selectedHatId]);
  const { data: fullSelectedHat, isLoading: hatLoading } = useHatDetails({
    hatId: selectedHatId,
    chainId,
  });
  const selectedHatDetails = useMemo(
    () => _.get(selectedHat, 'detailsObject.data'),
    [selectedHat],
  );

  // *********************
  // * ONCHAIN HAT
  // *********************
  const selectedOnchainHat = useMemo(
    () => _.find(onchainTree, ['id', selectedHatId]),
    [onchainTree, selectedHatId],
  );
  const selectedOnchainHatDetails = useMemo(
    () => _.get(selectedOnchainHat, 'detailsObject.data'),
    [selectedOnchainHat],
  );
  const isDraft = useMemo(
    () => !_.includes(_.map(onchainHats, 'id'), selectedHat?.id),
    [onchainHats, selectedHat],
  );

  // *********************
  // * WEARERS AND ELIGIBILITY
  // *********************
  // could consider only checking eligible wearers (move to after eligibility check)
  const { data: hatWearers, isLoading: wearersLoading } = useHatWearers({
    hat: selectedHat,
    chainId,
    editMode,
  });
  const { data: wearersEligibility, isLoading: wearerEligibilityLoading } =
    useWearersEligibilityCheck({
      selectedHat,
      chainId,
      editMode,
    });
  const { eligibleWearers, ineligibleWearers } = useMemo(() => {
    const {
      eligibleWearers: eligibleWearerIds,
      ineligibleWearers: ineligibleWearerIds,
    } = _.pick(wearersEligibility, ['eligibleWearers', 'ineligibleWearers']);
    const localEligibleWearers = _.filter(hatWearers, (w: HatWearer) =>
      _.includes(eligibleWearerIds, w.id),
    );
    const localIneligibleWearers = _.filter(hatWearers, (w: HatWearer) =>
      _.includes(ineligibleWearerIds, w.id),
    );
    return {
      eligibleWearers: localEligibleWearers,
      ineligibleWearers: localIneligibleWearers,
    };
  }, [wearersEligibility, hatWearers]);

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
      // queryClient.invalidateQueries(['hatDetails', { chainId, id }]);
      // queryClient.invalidateQueries(['wearersList', id]);

      const allIds = _.map(orgChartTree, 'id');
      const hat = _.find(orgChartTree, ['id', id]);
      if (!_.includes(allIds, id) || !hat) return;

      // if it's linked
      if (hat.treeId && treeId && hat.treeId !== treeId) {
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

      // setSelectedHatId(id);
      let existingQuery = router.query;
      if (compact === 'true') {
        existingQuery = { ...existingQuery, compact: 'true' };
      }
      if (flipped === 'true') {
        existingQuery = { ...existingQuery, flipped: 'true' };
      }

      const updatedQuery = {
        ...existingQuery,
        treeId: hat.treeId
          ? treeIdHexToDecimal(hat.treeId)
          : treeIdHexToDecimal(treeId),
        hatId: hatIdDecimalToIp(BigInt(id)),
      };
      const updatedUrl = {
        pathname: router.pathname,
        query: updatedQuery,
      };

      router.push(updatedUrl, undefined, { shallow: true });

      onCloseTreeDrawer?.();
      onOpenHatDrawer?.();
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgChartTree, isMobile, flipped, compact, chainId],
  );

  // useEffect(() => {
  //   if (initialHatId && orgChartTree) {
  //     handleSelectHat(ipToHatId(String(initialHatId)));
  //   }
  // }, [initialHatId, orgChartTree, handleSelectHat]);

  if (!selectedHat && isHatDrawerOpen) {
    onCloseHatDrawer?.();
  }

  // *********************
  // * Authorities
  // *********************

  const { selectedHatGuildRoles } = useGuilds({
    guilds: _.get(topHatDetails, 'guilds'),
    hatId: selectedHat?.id,
    editMode,
  });

  const { selectedHatSpaces } = useSpaces({
    spaces: _.get(topHatDetails, 'spaces'),
    hatId: selectedHat?.id,
    chainId,
    editMode,
  });

  const { modulesAuthorities } = useAncillaryModules({
    id: selectedHatId,
    chainId,
    editMode,
    tree: orgChartTree,
  });

  const { data: combinedAuthorities } = combineAuthorities({
    authorities: _.get(selectedHatDetails, 'authorities'),
    guildRoles: selectedHatGuildRoles,
    spaces: selectedHatSpaces,
    modulesAuthorities,
  });

  const returnValue = useMemo(
    () => ({
      // SELECTED HAT
      selectedHat: fullSelectedHat || undefined,
      selectedHatDetails,
      hatWearers,
      eligibleWearers,
      ineligibleWearers,
      chainId,
      hatLoading,
      wearersLoading: wearersLoading || wearerEligibilityLoading,
      // ONCHAIN HAT
      isDraft,
      selectedOnchainHat,
      selectedOnchainHatDetails,
      // AUTHORITIES
      selectedHatGuildRoles,
      selectedHatSpaces,
      combinedAuthorities,
      // ACTIONS
      handleSelectHat,
      // RELATIONS
      hierarchy,
    }),
    [
      // SELECTED HAT
      fullSelectedHat,
      selectedHatDetails,
      hatWearers,
      eligibleWearers,
      ineligibleWearers,
      chainId,
      hatLoading,
      wearersLoading,
      wearerEligibilityLoading,
      // ONCHAIN HAT
      isDraft,
      selectedOnchainHat,
      selectedOnchainHatDetails,
      // AUTHORITIES
      selectedHatGuildRoles,
      selectedHatSpaces,
      combinedAuthorities,
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
