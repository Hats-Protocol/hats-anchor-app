import { useDisclosure, UseDisclosureReturn } from '@chakra-ui/react';
import {
  hatIdDecimalToIp,
  treeIdHexToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import { useAncillaryModules } from 'hats-hooks';
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
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createHierarchy, ipToHatId } from 'shared';
import {
  AppHat,
  Authority,
  HatDetails,
  Hierarchy,
  SupportedChains,
} from 'types';
import { Hex } from 'viem';
import { useQueryClient } from 'wagmi';

import { useTreeForm } from './TreeFormContext';

export interface SelectedHatContext {
  // SELECTED HAT
  selectedHat: AppHat | undefined;
  selectedHatDetails: HatDetails | undefined;
  chainId: SupportedChains | undefined;
  // ONCHAIN HAT
  isDraft: boolean;
  selectedOnchainHat: AppHat | undefined;
  selectedOnchainHatDetails: HatDetails | undefined;
  // AUTHORITIES
  selectedHatGuildRoles: Authority[] | undefined;
  selectedHatSpaces: Authority[] | undefined;
  combinedAuthorities: Authority[] | undefined;
  // ACTIONS
  setSelectedHatId: ((id: Hex | undefined) => void) | undefined;
  handleSelectHat: ((id: Hex) => void) | undefined;
  // DISCLOSURE
  hatDisclosure: UseDisclosureReturn | undefined;
  // RELATIONS
  hierarchy: Hierarchy | undefined;
}

export const SelectedHatContext = createContext<SelectedHatContext>({
  // SELECTED HAT
  selectedHat: undefined,
  selectedHatDetails: undefined,
  chainId: undefined,
  // ONCHAIN HAT
  isDraft: false,
  selectedOnchainHat: undefined,
  selectedOnchainHatDetails: undefined,
  // AUTHORITIES
  selectedHatGuildRoles: undefined,
  selectedHatSpaces: undefined,
  combinedAuthorities: undefined,
  // ACTIONS
  setSelectedHatId: undefined,
  handleSelectHat: undefined,
  // DISCLOSURE
  hatDisclosure: undefined,
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
  const queryClient = useQueryClient();
  const { hatId: initialHatIdParam } = router.query;
  let initialHatId: string | undefined;
  const { flipped, compact } = _.pick(router.query, ['flipped', 'compact']);
  if (_.isArray(initialHatIdParam)) {
    initialHatId = _.first(initialHatId);
  } else {
    initialHatId = initialHatIdParam as string;
  }
  const [selectedHatId, setSelectedHatId] = useState<Hex | undefined>(
    ipToHatId(hatId) || ipToHatId(initialHatId as string) || undefined,
  );
  const {
    editMode,
    topHatDetails,
    onchainHats,
    onchainTree,
    orgChartTree,
    treeDisclosure,
  } = useTreeForm();
  const { isMobile } = useMediaStyles();

  const hatDisclosure = useDisclosure({
    onClose: () => {
      setSelectedHatId(undefined);
      router.push(
        { pathname: router.pathname, query: _.omit(router.query, 'hatId') },
        undefined,
        {
          shallow: true,
        },
      );
    },
  });
  const { onOpen: onOpenHatDrawer } = hatDisclosure;
  const onCloseTreeDrawer = treeDisclosure?.onClose;

  // *********************
  // * SELECTED HAT
  // *********************
  const selectedHat = useMemo(() => {
    return _.find(orgChartTree, ['id', selectedHatId]);
  }, [orgChartTree, selectedHatId]);
  const selectedHatDetails = useMemo(
    () => _.get(selectedHat, 'detailsObject.data'),
    [selectedHat],
  );
  // selected onchain hat
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
      queryClient.invalidateQueries(['hatDetails', { chainId, id }]);
      queryClient.invalidateQueries(['wearersList', id]);
      // queryClient.invalidateQueries(['allWearers', id]);
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

      setSelectedHatId(id);
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
      onOpenHatDrawer();
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgChartTree, isMobile, flipped, compact, chainId],
  );

  useEffect(() => {
    if (initialHatId && orgChartTree) {
      handleSelectHat(ipToHatId(String(initialHatId)));
    }
  }, [initialHatId, orgChartTree, handleSelectHat]);

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
      setSelectedHatId,
      handleSelectHat,
      // DISCLOSURE
      hatDisclosure,
      // RELATIONS
      hierarchy,
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
      setSelectedHatId,
      handleSelectHat,
      // DISCLOSURE
      hatDisclosure,
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
