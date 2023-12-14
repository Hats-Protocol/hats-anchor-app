import { useDisclosure, UseDisclosureReturn } from '@chakra-ui/react';
import {
  hatIdDecimalToIp,
  treeIdHexToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import { DEFAULT_HAT } from 'app-constants';
import {
  useBetterMediaQuery,
  useGuilds,
  useImageURIs,
  useLocalStorage,
  useOrgChartTree,
  useSnapshotSpaces as useSpaces,
} from 'app-hooks';
import {
  generateLocalStorageKey,
  ipfsUrl,
  removeAndHandleSiblings,
  removeAndHandleSiblingsOrgChart,
} from 'app-utils';
import {
  useAncillaryModules,
  useManyHatsDetails,
  useManyHatsDetailsField,
  useTreeDetails,
  useWearersControllersDetails,
} from 'hats-hooks';
import {
  Authority,
  FormData,
  Hat,
  HatDetails,
  HatEvent,
  HatWearer,
  Hierarchy,
  LinkRequest,
  SupportedChains,
} from 'hats-types';
import { combineAuthorities, translateDrafts } from 'hats-utils';
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
import { createHierarchy, ipToHatId, mapWithChainId } from 'shared-utils';
import { Hex } from 'viem';
import { useQueryClient } from 'wagmi';

export interface TreeFormContext {
  chainId: SupportedChains | undefined;
  treeId: Hex | undefined;
  topHat: Hat | undefined;
  // tree
  topHatDetails: HatDetails | undefined;
  selectedHatDetails: HatDetails | undefined;
  isDraft: boolean;
  treeToDisplay: Hat[] | undefined;
  onchainTree: Hat[] | undefined;
  onchainHats: Hat[] | undefined;
  selectedOnchainHat: Hat | undefined;
  selectedOnchainHatDetails: HatDetails | undefined;
  selectedHatGuildRoles: Authority[] | undefined;
  selectedHatSpaces: Authority[] | undefined;
  combinedAuthorities: Authority[] | undefined;
  treeEvents: HatEvent[] | undefined;
  isLoading: boolean;
  linkRequestFromTree: LinkRequest[] | undefined;
  linkedHatIds?: Hex[];
  wearersAndControllers: HatWearer[] | undefined;
  // local storage
  storedData: Partial<FormData>[] | undefined;
  setStoredData: ((v: Partial<FormData>[]) => void) | undefined;
  // controls
  editMode: boolean;
  setEditMode: ((v: boolean) => void) | undefined;
  toggleEditMode: (() => void) | undefined;
  selectedHat: Hat | undefined;
  setSelectedHatId: ((id: Hex | undefined) => void) | undefined;
  selectedOption: string | undefined;
  setSelectedOption: ((v: string) => void) | undefined;
  showInactiveHats: boolean;
  setShowInactiveHats: ((v: boolean) => void) | undefined;
  // actions
  addHat: ((hat: Hat, parentId: Hex) => void) | undefined;
  handleSelectHat: ((id: Hex) => void) | undefined;
  handleFlipChart: ((isFlipped: boolean) => void) | undefined;
  handleSetCompact: ((isCompact: boolean) => void) | undefined;
  removeHat: ((hatId: Hex) => void) | undefined;
  resetTree: (() => void) | undefined;
  importHats: ((hats: Partial<FormData>[]) => void) | undefined;
  // disclosures
  hatDisclosure: UseDisclosureReturn | undefined;
  treeDisclosure: UseDisclosureReturn | undefined;
  patchTree: ((proposedHats: Hat[]) => void) | undefined;
  hierarchy: Hierarchy | undefined;
}

export const TreeFormContext = createContext<TreeFormContext>({
  chainId: undefined,
  treeId: undefined,
  topHat: undefined,
  // tree
  topHatDetails: undefined,
  selectedHatDetails: undefined,
  isDraft: false,
  treeToDisplay: undefined,
  onchainTree: undefined,
  onchainHats: undefined,
  selectedOnchainHat: undefined,
  selectedOnchainHatDetails: undefined,
  selectedHatGuildRoles: undefined,
  selectedHatSpaces: undefined,
  combinedAuthorities: undefined,
  treeEvents: undefined,
  isLoading: true,
  linkRequestFromTree: undefined,
  linkedHatIds: undefined,
  wearersAndControllers: undefined,
  // local storage
  storedData: undefined,
  setStoredData: undefined,
  // controls
  editMode: false,
  setEditMode: undefined,
  toggleEditMode: undefined,
  selectedHat: undefined,
  setSelectedHatId: undefined,
  selectedOption: undefined,
  setSelectedOption: undefined,
  showInactiveHats: true,
  setShowInactiveHats: undefined,
  // actions
  handleSelectHat: undefined,
  handleFlipChart: undefined,
  handleSetCompact: undefined,
  addHat: undefined,
  removeHat: undefined,
  resetTree: undefined,
  importHats: undefined,
  // disclosures
  hatDisclosure: undefined,
  treeDisclosure: undefined,
  patchTree: undefined,
  hierarchy: undefined,
});

// cascade of hats data to get the org chart type
// orgChartHats
//    -> useManyHatDetails (initialData: initialTreeData.hats)
//       -> useManyHatsDetailsField
//       -> useWearersControllersDetails
//       -> useImageURIs
//          -> useOrgChartTree (all pass to)

export const TreeFormContextProvider = ({
  treeId,
  chainId,
  // linkedHatIds,
  children,
}: {
  treeId: Hex;
  chainId: SupportedChains;
  // linkedHatIds: Hex[] | undefined;
  children: ReactNode;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  let { hatId: initialHatId } = router.query;
  const { flipped, compact } = _.pick(router.query, ['flipped', 'compact']);
  if (_.isArray(initialHatId)) {
    initialHatId = _.first(initialHatId);
  }
  const [selectedHatId, setSelectedHatId] = useState<Hex | undefined>(
    initialHatId ? ipToHatId(initialHatId as string) : undefined,
  );
  const [editMode, setEditMode] = useState(false);
  const [showInactiveHats, setShowInactiveHats] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    'wearers',
  );
  const [orgChartHats, setOrgChartHats] = useState<Hat[] | undefined>();
  const isMobile = useBetterMediaQuery('(max-width: 767px)');

  const localStorageKey = generateLocalStorageKey(chainId, treeId);
  const [storedData, setStoredData] = useLocalStorage<Partial<FormData>[]>(
    localStorageKey,
    [],
  );

  const hatDisclosure = useDisclosure({
    onClose: () => {
      setSelectedHatId(undefined);
      // remove query param for adding children
      router.push(
        { pathname: router.pathname, query: _.omit(router.query, 'hatId') },
        undefined,
        {
          shallow: true,
        },
      );
    },
  });
  const treeDisclosure = useDisclosure();

  const { onOpen: onOpenHatDrawer, onClose: onCloseHatDrawer } = hatDisclosure;
  const { onOpen: onOpenTreeDrawer, onClose: onCloseTreeDrawer } =
    treeDisclosure;

  // existing tree
  const { data: treeData } = useTreeDetails({
    treeId,
    chainId,
    editMode,
  });
  const linkedHatIds = useMemo(() => {
    const { linkedToHat, parentOfTrees } = _.pick(treeData, [
      'linkedToHat',
      'parentOfTrees',
    ]);
    return _.compact(
      _.concat(_.map(parentOfTrees, 'hats[0].id'), _.get(linkedToHat, 'id')),
    );
  }, [treeData]);

  useEffect(() => {
    setOrgChartHats(treeData?.hats);
  }, [treeData?.hats]);

  const treeEvents = _.get(treeData, 'events');

  const { data: onchainLinkedHats } = useManyHatsDetails({
    hats: mapWithChainId(
      _.map(linkedHatIds, (id: Hex) => ({ id })),
      chainId,
    ),
    initialHats: _.map(linkedHatIds, (id: Hex) => ({ id })),
  });
  const onchainHats = useMemo(() => {
    return _.compact(_.concat(_.get(treeData, 'hats'), onchainLinkedHats));
  }, [treeData, onchainLinkedHats]);
  const linkRequestFromTree = _.get(treeData, 'linkRequestFromTree');

  // get difference between onchain hats and org chart hats
  const draftHats = useMemo(
    () =>
      _.reject(
        orgChartHats,
        (hat: Hat) =>
          _.includes(_.map(onchainHats, 'id'), _.get(hat, 'id')) ||
          _.isEmpty(_.reject(hat, ['id', 'parentId'])),
      ),
    [onchainHats, orgChartHats],
  );

  // *********************
  // * ONCHAIN TREE (ONCHAIN HATS)
  // *********************
  const onchainIds = _.map(onchainHats, ({ id }: { id: Hex }) => ({ id }));
  const { data: onchainHatDetails } = useManyHatsDetails({
    hats: mapWithChainId(onchainIds, chainId),
    initialHats: mapWithChainId(onchainIds, chainId),
    editMode,
  });
  const { data: onchainDetailsFields, isLoading: onchainDetailsFieldsLoading } =
    useManyHatsDetailsField({
      hats: onchainHatDetails,
      editMode,
      onchain: true,
    });
  // const onchainWearersAndControllers = useWearersControllersDetails({
  //   hats: onchainHatDetails,
  //   editMode,
  //   onchain: true,
  // });
  const { data: onchainImagesData, isLoading: onchainImagesLoading } =
    useImageURIs({
      hats: onchainHatDetails,
      onchainHats,
      editMode,
      onchain: true,
    });
  const { orgChartTree: onchainTree } = useOrgChartTree({
    treeData,
    chainId,
    hatsData: onchainHatDetails,
    detailsData: onchainDetailsFields,
    imagesData: onchainImagesData,
    draftHats,
    imagesLoaded: !onchainImagesLoading,
    detailsLoaded: !onchainDetailsFieldsLoading,
    initialHatIds: _.map(onchainHats, 'id'),
    editMode,
    onchain: true,
  });

  // *********************
  // * TREE TO DISPLAY (ORG CHART HATS)
  // *********************
  const { data: hatDetails } = useManyHatsDetails({
    hats: mapWithChainId(
      _.compact(_.concat(orgChartHats, onchainLinkedHats)),
      chainId,
    ),
    initialHats: mapWithChainId(onchainIds, chainId),
    editMode,
  });
  const { data: detailsFields, isLoading: detailsFieldsLoading } =
    useManyHatsDetailsField({
      hats: hatDetails,
      onchainHats,
      editMode,
    });
  const wearersAndControllers = useWearersControllersDetails({
    hats: hatDetails,
    editMode,
  });
  const { data: imagesData, isLoading: imagesLoading } = useImageURIs({
    hats: hatDetails,
    onchainHats,
    editMode,
  });
  const { orgChartTree } = useOrgChartTree({
    treeData,
    chainId,
    hatsData: hatDetails,
    detailsData: detailsFields,
    imagesData,
    draftHats,
    imagesLoaded: !imagesLoading,
    detailsLoaded: !detailsFieldsLoading,
    initialHatIds: _.map(onchainHats, 'id'),
    editMode,
  });

  // *********************
  // * TREE TOGGLE (INACTIVE HATS + OVERRIDE WITH CURRENT IMAGE AND NAME)
  // *********************
  const filteredTree = useMemo(() => {
    if (showInactiveHats) return orgChartTree;

    const inactiveHats = _.map(
      _.filter(orgChartTree, ['status', false]),
      (h: Hat) => {
        return _.get(h, 'prettyId');
      },
    );
    const inactiveAncestors = _.map(
      _.filter(orgChartTree, (hat: Hat) =>
        _.some(inactiveHats, (h: Hex) => h && hat.prettyId?.includes(h)),
      ),
      'prettyId',
    );

    return _.reject(orgChartTree, (h: Hat) =>
      _.includes(_.concat(inactiveHats, inactiveAncestors), h.prettyId),
    );
  }, [orgChartTree, showInactiveHats]);
  const overrideOrgChartData = useMemo(() => {
    return _.map(filteredTree, (hat: Hat) => {
      const matchingHat = _.find(storedData, { id: hat.id });
      const orgChartHat = _.find(filteredTree, { id: hat.id });

      if (!_.isEmpty(_.reject(_.keys(matchingHat), 'id'))) {
        return {
          ...hat,
          // could translate more stored data
          displayName: matchingHat?.name,
          imageUrl: matchingHat?.imageUrl || orgChartHat?.imageUrl,
        };
      }
      return hat;
    });
  }, [filteredTree, storedData]);
  const treeToDisplay = useMemo(() => {
    const noHatsOutsideTree = _.reject(
      overrideOrgChartData,
      (hat: { id: string }) => treeData?.id && !hat.id.startsWith(treeData?.id),
    ) as Hat[];
    return editMode ? noHatsOutsideTree : filteredTree;
  }, [editMode, overrideOrgChartData, treeData?.id, filteredTree]);

  // *********************
  // * TOP HAT
  // *********************
  const topHat: Hat | undefined = useMemo(
    () => _.first(orgChartTree),
    [orgChartTree],
  );
  const topHatDetails = useMemo(
    () => _.get(topHat, 'detailsObject.data'),
    [topHat],
  );

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

      onCloseTreeDrawer();
      onOpenHatDrawer();
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgChartTree, isMobile, flipped, compact, chainId],
  );

  const handleFlipChart = useCallback(
    (isFlipped: boolean) => {
      let updatedQuery = {
        ...router.query,
      };

      if (isFlipped) {
        updatedQuery = { ...updatedQuery, flipped: 'true' };
      } else {
        delete updatedQuery.flipped;
      }

      const updatedUrl = {
        pathname: router.pathname,
        query: updatedQuery,
      };

      router.push(updatedUrl, undefined, { shallow: true });
    },
    [router],
  );

  const handleSetCompact = useCallback(
    (isCompact: boolean) => {
      let updatedQuery = {
        ...router.query,
      };

      if (isCompact) {
        updatedQuery = { ...updatedQuery, compact: 'true' };
      } else {
        delete updatedQuery.compact;
      }

      const updatedUrl = {
        pathname: router.pathname,
        query: updatedQuery,
      };

      router.push(updatedUrl, undefined, { shallow: true });
    },
    [router],
  );

  const toggleEditMode = useCallback(() => {
    if (!editMode) {
      const localDraftHats = _.reject(
        storedData,
        (hat: Partial<FormData>) =>
          _.includes(_.map(onchainHats, 'id'), hat.id) ||
          _.isEmpty(_.reject(hat, ['id', 'parentId'])),
      );
      if (!_.isEmpty(localDraftHats)) {
        const drafts = translateDrafts({
          chainId,
          treeId,
          drafts: localDraftHats,
        });
        setOrgChartHats(_.concat(onchainHats, drafts));
      }
      onOpenTreeDrawer();
    } else {
      onCloseTreeDrawer();
      setOrgChartHats(onchainHats);
    }
    setEditMode(!editMode);
    setSelectedHatId(undefined);
    const updatedQuery = _.omit(router.query, 'hatId');
    router.push({ pathname: router.pathname, query: updatedQuery }, undefined, {
      shallow: true,
    });
    setSelectedOption('wearers');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onchainHats, editMode, storedData, chainId, treeId]);

  const addHat = useCallback(
    (hat: Hat, parentId: Hex) => {
      if (!editMode) return;
      // set updated tree array
      const newHat = {
        ...DEFAULT_HAT,
        ...hat, // handles treeId?
      };
      setOrgChartHats((prev) => {
        const tempHats = _.cloneDeep(prev);
        if (!tempHats) return [];
        return _.concat(tempHats, [newHat]);
      });

      const newDetails = _.get(newHat, 'detailsObject.data');
      const onlyNeededKeys = {
        id: newHat.id,
        parentId,
        ...newDetails,
      };
      const removeCurrentId = _.reject(storedData, ['id', newHat.id]);
      setStoredData?.(_.concat(removeCurrentId, onlyNeededKeys as FormData));
      // const updatedQuery = {
      //   ...router.query,
      //   hatId: hatIdDecimalToIp(BigInt(hat.id)),
      // };
      // const updatedUrl = {
      //   pathname: router.pathname,
      //   query: updatedQuery,
      // };

      // any way to get this to stick? always reverts to parent
      // router.push(updatedUrl, undefined, { shallow: true });
    },
    [editMode, storedData, setStoredData],
  );

  const removeHat = useCallback(
    (hatId: Hex) => {
      setStoredData((prev) => {
        const tempData = _.cloneDeep(prev);
        if (!tempData) return [];
        const result = removeAndHandleSiblings(tempData, hatId);
        return result;
      });
      setOrgChartHats((prev) => {
        const tempHats = _.cloneDeep(prev);
        if (!tempHats) return [];
        const result = removeAndHandleSiblingsOrgChart(tempHats, hatId);
        return result;
      });
      onOpenTreeDrawer();
      onCloseHatDrawer();
    },
    [setStoredData, onCloseHatDrawer, onOpenTreeDrawer],
  );

  // HatExport[] -> FormData[]
  const importHats = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hats: any[]) => {
      const translateImageUrl = _.map(hats, (hat) => {
        // don't try to compute image url if imageUri is empty
        const imageUrl = hat.imageUri
          ? { imageUrl: ipfsUrl(hat.imageUri?.slice(7)) }
          : {};
        return {
          ...hat,
          ...imageUrl,
        };
      });
      setStoredData?.(translateImageUrl);
      const localDraftHats = _.reject(
        translateImageUrl,
        (hat: Hat) =>
          _.includes(_.map(onchainHats, 'id'), hat.id) ||
          _.isEmpty(_.reject(hat, ['id', 'parentId'])),
      );
      if (!_.isEmpty(localDraftHats)) {
        const drafts = translateDrafts({
          chainId,
          treeId,
          drafts: localDraftHats,
        });
        setOrgChartHats(_.concat(onchainHats, drafts));
      }
    },
    [chainId, treeId, onchainHats, setStoredData],
  );

  const resetTree = useCallback(() => {
    setOrgChartHats(onchainHats);
    setStoredData([]);
    setEditMode(false);
    setSelectedHatId(undefined);
    setSelectedOption('wearers');
    onCloseTreeDrawer();
  }, [onchainHats, setStoredData, onCloseTreeDrawer]);

  const patchTree = useCallback((proposedHats: Hat[]) => {
    setOrgChartHats((prevHats) => {
      if (!prevHats) return [];

      return _.map(prevHats, (existingHat: { id: Hex }) => {
        const proposedHat = _.find(proposedHats, ['id', existingHat.id]);

        if (proposedHat) {
          return {
            ...existingHat,
            ...proposedHat,
          };
        }
        return existingHat;
      });
    });
  }, []);

  const hierarchy = useMemo(() => {
    const parentsAndIds = _.map(orgChartTree, (hat: Hat) => ({
      id: hat.id,
      parentId: hat.admin?.id,
    }));
    return createHierarchy(parentsAndIds, selectedHat?.id);
  }, [orgChartTree, selectedHat]);

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
  });

  const { data: combinedAuthorities } = combineAuthorities({
    authorities: _.get(selectedHatDetails, 'authorities'),
    guildRoles: selectedHatGuildRoles,
    spaces: selectedHatSpaces,
    modulesAuthorities,
  });

  const returnValue = useMemo(
    () => ({
      chainId,
      treeId,
      topHat,
      // tree
      topHatDetails,
      selectedHatDetails,
      isDraft,
      treeToDisplay,
      onchainTree,
      onchainHats,
      treeEvents,
      isLoading: imagesLoading || detailsFieldsLoading,
      linkRequestFromTree,
      linkedHatIds,
      wearersAndControllers,
      // local storage
      storedData,
      setStoredData,
      // controls
      editMode,
      setEditMode,
      toggleEditMode,
      selectedHat,
      selectedOnchainHat,
      selectedOnchainHatDetails,
      selectedHatGuildRoles,
      selectedHatSpaces,
      combinedAuthorities,
      setSelectedHatId,
      selectedOption,
      setSelectedOption,
      showInactiveHats,
      setShowInactiveHats,
      // actions
      handleSelectHat,
      handleFlipChart,
      handleSetCompact,
      addHat,
      removeHat,
      resetTree,
      importHats,
      // disclosures
      hatDisclosure,
      treeDisclosure,
      patchTree,
      hierarchy,
    }),
    [
      chainId,
      treeId,
      topHat,
      // tree
      topHatDetails,
      selectedHatDetails,
      isDraft,
      treeToDisplay,
      onchainTree,
      onchainHats,
      treeEvents,
      imagesLoading,
      detailsFieldsLoading,
      linkRequestFromTree,
      linkedHatIds,
      wearersAndControllers,
      // local storage
      storedData,
      setStoredData,
      // controls
      editMode,
      setEditMode,
      toggleEditMode,
      selectedHat,
      selectedOnchainHat,
      selectedOnchainHatDetails,
      selectedHatGuildRoles,
      selectedHatSpaces,
      combinedAuthorities,
      setSelectedHatId,
      selectedOption,
      setSelectedOption,
      showInactiveHats,
      setShowInactiveHats,
      // actions
      handleSelectHat,
      handleFlipChart,
      handleSetCompact,
      addHat,
      removeHat,
      resetTree,
      importHats,
      // disclosures
      hatDisclosure,
      treeDisclosure,
      patchTree,
      hierarchy,
    ],
  );

  return (
    <TreeFormContext.Provider value={returnValue}>
      {children}
    </TreeFormContext.Provider>
  );
};

export const useTreeForm = () => useContext(TreeFormContext);
