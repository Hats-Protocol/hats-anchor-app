import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useAncillaryModules } from 'hats-hooks';
import { combineAuthorities } from 'hats-utils';
import {
  useGuilds,
  useMediaStyles,
  useSelectedHatDisclosure,
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
import { createHierarchy } from 'shared';
import {
  AppHat,
  Authority,
  HatDetails,
  Hierarchy,
  SupportedChains,
} from 'types';
import { Hex } from 'viem';

import { useTreeForm } from './TreeFormContext';

export interface SelectedHatContext {
  // SELECTED HAT
  selectedHat: AppHat | undefined;
  selectedHatDetails: HatDetails | undefined;
  chainId: SupportedChains | undefined;
  hatLoading: boolean;
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
  // DISCLOSURE
  isOpen: boolean;
  onOpen: ((hatId: Hex) => void) | undefined;
  onClose: (() => void) | undefined;
  returnToTreeList: (() => void) | undefined;
}

export const SelectedHatContext = createContext<SelectedHatContext>({
  // SELECTED HAT
  selectedHat: undefined,
  selectedHatDetails: undefined,
  chainId: undefined,
  hatLoading: false,
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
  // DISCLOSURE
  isOpen: false,
  onOpen: undefined,
  onClose: undefined,
  returnToTreeList: undefined,
});

export const SelectedHatContextProvider = ({
  treeId,
  chainId,
  hatId,
  children,
}: {
  treeId: Hex;
  chainId: SupportedChains;
  hatId?: Hex | undefined;
  children: ReactNode;
}) => {
  const router = useRouter();
  const { flipped, compact } = _.pick(router.query, ['flipped', 'compact']);
  const {
    editMode,
    topHatDetails,
    onchainHats,
    onchainTree,
    orgChartTree,
    onOpenTreeDrawer,
    onCloseTreeDrawer,
  } = useTreeForm();
  const { isMobile } = useMediaStyles();

  const hatDisclosure = useSelectedHatDisclosure(hatId);
  const { isOpen, onOpen, onClose } = _.pick(hatDisclosure, [
    'isOpen',
    'onOpen',
    'onClose',
  ]);

  const returnToTreeList = useCallback(() => {
    onOpenTreeDrawer?.();
    onClose?.();
  }, []);
  console.log('selected hat context', hatId);

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
  console.log(selectedHat, selectedHatDetails);

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
  const isDraft = useMemo(
    () => !_.includes(_.map(onchainHats, 'id'), selectedHat?.id),
    [onchainHats, selectedHat],
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

      onCloseTreeDrawer?.();
      onOpen?.(id);
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgChartTree, isMobile, flipped, compact, chainId],
  );

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
    id: hatId,
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
      selectedHat,
      selectedHatDetails,
      // eligibleWearers,
      // ineligibleWearers,
      chainId,
      hatLoading: !selectedHat || !selectedHatDetails,
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
      // DISCLOSURE
      isOpen,
      onOpen,
      onClose,
      returnToTreeList,
    }),
    [
      // SELECTED HAT
      selectedHat,
      selectedHatDetails,
      chainId,
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
      // DISCLOSURE
      isOpen,
      onOpen,
      onClose,
      returnToTreeList,
    ],
  );

  return (
    <SelectedHatContext.Provider value={returnValue}>
      {children}
    </SelectedHatContext.Provider>
  );
};

export const useSelectedHat = () => useContext(SelectedHatContext);
