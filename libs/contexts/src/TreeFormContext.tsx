'use client';

import { useDisclosure } from '@chakra-ui/react';
import { DEFAULT_HAT } from '@hatsprotocol/constants';
import { HatsEvent } from '@hatsprotocol/sdk-v1-subgraph';
import { useManyHatsDetails, useTreeDetails, useTreeWearers } from 'hats-hooks';
import { DetailsData, translateDrafts } from 'hats-utils';
import {
  useImageURIs,
  useLocalStorage,
  useOrgChartTree,
  useSelectedHatDisclosure,
  useTreeGuilds,
  useTreeImages,
  useTreeSnapshotSpaces,
} from 'hooks';
import _ from 'lodash';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { mapWithChainId } from 'shared';
import {
  AppHat,
  FormData,
  HatDetails,
  HatWearer,
  LinkRequest,
  SnapshotSpace,
  SupportedChains,
} from 'types';
import {
  generateLocalStorageKey,
  getInactiveIds,
  getPathParams,
  getQueryParams,
  Guild,
  ipfsUrl,
  removeAndHandleSiblings,
  removeAndHandleSiblingsOrgChart,
  urlFromQueryParams,
} from 'utils';
import { Hex } from 'viem';

export interface TreeFormContext {
  chainId: SupportedChains | undefined;
  treeId: number | undefined;
  topHat: AppHat | undefined;
  // tree
  topHatDetails: HatDetails | undefined;
  treeToDisplay: AppHat[] | undefined;
  treeToDisplayWithInactiveHats: AppHat[] | undefined;
  onchainTree: AppHat[] | undefined;
  onchainHats: AppHat[] | undefined;

  treeEvents: HatsEvent[] | undefined;
  isLoading: boolean;
  linkRequestFromTree: LinkRequest[] | undefined;
  linkedHatIds?: Hex[];
  orgChartWearers: HatWearer[] | undefined;
  inactiveHats: string[] | undefined;
  orgChartTree: AppHat[] | undefined;
  guildData: Guild[] | undefined;
  snapshotData: SnapshotSpace[] | undefined;
  treeError: Error | undefined;
  // local storage
  storedConfig: { flipped?: boolean; compact?: boolean; collapsed?: string[] };
  storedData: Partial<FormData>[] | undefined;
  setStoredData: ((v: Partial<FormData>[]) => void) | undefined;
  // controls
  editMode: boolean;
  setEditMode: ((v: boolean) => void) | undefined;
  toggleEditMode: (() => void) | undefined;
  selectedOption: string | undefined;
  setSelectedOption: ((v: string) => void) | undefined;
  showInactiveHats: boolean;
  setShowInactiveHats: ((v: boolean) => void) | undefined;
  // actions
  addHat: ((hat: AppHat, parentId: Hex) => void) | undefined;
  handleFlipChart: ((isFlipped: boolean) => void) | undefined;
  handleSetCompact: ((isCompact: boolean) => void) | undefined;
  handleNodeCollapsedOrExpanded:
    | ((nodeIdIp: string, expanded: boolean) => void)
    | undefined;
  handleExpandAll: (() => void) | undefined;
  removeHat: ((hatId: Hex) => void) | undefined;
  resetTree: (() => void) | undefined;
  importHats: ((hats: Partial<FormData>[]) => void) | undefined;
  patchTree: ((proposedHats: AppHat[]) => void) | undefined;
  // tree list disclosure
  isTreeDrawerOpen: boolean;
  onOpenTreeDrawer: (() => void) | undefined;
  onCloseTreeDrawer: (() => void) | undefined;
  returnToTreeList: (() => void) | undefined;
  isHatDrawerOpen: boolean;
  onOpenHatDrawer: ((hatId: Hex) => void) | undefined;
  onCloseHatDrawer: (() => void) | undefined;
}

export const TreeFormContext = createContext<TreeFormContext>({
  chainId: undefined,
  treeId: undefined,
  topHat: undefined,
  // tree
  topHatDetails: undefined,
  treeToDisplay: undefined,
  treeToDisplayWithInactiveHats: undefined,
  onchainTree: undefined,
  onchainHats: undefined,
  treeEvents: undefined,
  isLoading: true,
  linkRequestFromTree: undefined,
  linkedHatIds: undefined,
  orgChartWearers: undefined,
  inactiveHats: undefined,
  // local storage
  storedConfig: {},
  storedData: undefined,
  setStoredData: undefined,
  orgChartTree: undefined,
  guildData: undefined,
  snapshotData: undefined,
  treeError: undefined,
  // controls
  editMode: false,
  setEditMode: undefined,
  toggleEditMode: undefined,
  selectedOption: undefined,
  setSelectedOption: undefined,
  showInactiveHats: true,
  setShowInactiveHats: undefined,
  // actions
  handleFlipChart: undefined,
  handleSetCompact: undefined,
  handleNodeCollapsedOrExpanded: undefined,
  handleExpandAll: undefined,
  addHat: undefined,
  removeHat: undefined,
  resetTree: undefined,
  importHats: undefined,
  patchTree: undefined,
  // tree list disclosure
  isTreeDrawerOpen: false,
  onOpenTreeDrawer: undefined,
  onCloseTreeDrawer: undefined,
  returnToTreeList: undefined,

  isHatDrawerOpen: false,
  onOpenHatDrawer: undefined,
  onCloseHatDrawer: undefined,
});

// cascade of hats data to get the org chart type
// orgChartHats
//    -> useManyHatDetails (initialData: initialTreeData.hats)
//       -> useManyHatsDetailsField
//       -> useWearersControllersDetails
//       -> useImageURIs
//          -> useOrgChartTree (all pass to)

export const TreeFormContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const pathname = usePathname();
  const { chainId, treeId, hatId: hatPathParam } = getPathParams(pathname);

  const params = useSearchParams();
  const queryParams = getQueryParams(params);
  const { hatId: hatQueryParam } = queryParams;

  const hatId = hatQueryParam || hatPathParam;
  // console.log({ chainId, treeId, hatId });

  const [editMode, setEditMode] = useState(false);
  const [showInactiveHats, setShowInactiveHats] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    'wearers',
  );
  const [orgChartHats, setOrgChartHats] = useState<AppHat[] | undefined>();

  const localStorageKey = generateLocalStorageKey(chainId, _.toString(treeId));
  const [storedData, setStoredData] = useLocalStorage<Partial<FormData>[]>(
    localStorageKey,
    [],
  );
  const [storedConfig, setStoredConfig] = useLocalStorage<{
    flipped?: boolean;
    compact?: boolean;
    collapsed?: string[];
  }>(`${localStorageKey}-config`, {});

  const treeDisclosure = useDisclosure();
  const hatDisclosure = useSelectedHatDisclosure({ treeId, chainId });
  const {
    isOpen: isTreeDrawerOpen,
    onOpen: onOpenTreeDrawer,
    onClose: onCloseTreeDrawer,
  } = _.pick(treeDisclosure, ['isOpen', 'onOpen', 'onClose']);
  const {
    isOpen: isHatDrawerOpen,
    onOpen: onOpenHatDrawer,
    onClose: onCloseHatDrawer,
  } = _.pick(hatDisclosure, ['isOpen', 'onOpen', 'onClose']);

  // existing tree
  const {
    data: treeData,
    isLoading: treeLoading,
    error: treeError,
  } = useTreeDetails({
    treeId,
    chainId,
    editMode,
  });
  const linkedHatIds: Hex[] = useMemo(() => {
    const { linkedToHat, parentOfTrees } = _.pick(treeData, [
      'linkedToHat',
      'parentOfTrees',
    ]);
    return _.compact(
      _.concat(_.map(parentOfTrees, 'hats[0].id'), _.get(linkedToHat, 'id')),
    );
  }, [treeData]);

  useEffect(() => {
    setOrgChartHats(treeData?.hats as AppHat[]);
  }, [treeData?.hats]);

  const treeEvents = _.get(treeData, 'events');

  const { data: onchainLinkedHats } = useManyHatsDetails({
    hats: mapWithChainId(
      _.map(linkedHatIds, (id: Hex) => ({ id })),
      chainId || 1,
    ),
    initialHats: _.map(linkedHatIds, (id: Hex) => ({ id })),
  });
  const onchainHats = useMemo(() => {
    return _.compact(_.concat(_.get(treeData, 'hats'), onchainLinkedHats));
  }, [treeData, onchainLinkedHats]);
  const linkRequestFromTree = _.get(
    treeData,
    'linkRequestFromTree',
  ) as unknown as LinkRequest[]; // TODO check this type, SDK type says it should be a Tree[]

  // get difference between onchain hats and org chart hats
  const draftHats = useMemo(
    () =>
      _.reject(
        orgChartHats,
        (hat: AppHat) =>
          _.includes(_.map(onchainHats, 'id'), _.get(hat, 'id')) ||
          _.isEmpty(_.reject(hat, ['id', 'parentId'])),
      ),
    [onchainHats, orgChartHats],
  );

  // *********************
  // * ONCHAIN TREE (ONCHAIN HATS)
  // *********************

  const onchainIds = _.map(onchainHats, ({ id }: { id: Hex }) => ({
    id,
  })) as unknown as object[];

  const { data: onchainHatDetails } = useManyHatsDetails({
    hats: mapWithChainId(onchainIds, chainId),
    initialHats: mapWithChainId(onchainIds, chainId),
    editMode,
  });

  const onchainDetailsFields: { id: string; detailsObject: DetailsData }[] =
    _.map(
      _.filter(onchainHatDetails, (hat) => {
        return (
          _.startsWith(_.get(hat, 'details'), 'ipfs://') &&
          _.get(hat, 'detailsMetadata') !== null
        );
      }),
      (hat) => {
        return {
          id: _.get(hat, 'details') as string,
          detailsObject: JSON.parse(_.get(hat, 'detailsMetadata') as string),
        };
      },
    );

  const { data: onchainWearers } = useTreeWearers({
    hats: onchainHatDetails,
    chainId,
    editMode,
  });

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
    orgChartWearers: onchainWearers,
    imagesLoaded: !onchainImagesLoading,
    detailsLoaded: true,
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

  const detailsFields: { id: string; detailsObject: DetailsData }[] = _.map(
    _.filter(hatDetails, (hat) => {
      return (
        _.startsWith(_.get(hat, 'details'), 'ipfs://') &&
        _.get(hat, 'detailsMetadata') !== null
      );
    }),
    (hat) => {
      return {
        id: _.get(hat, 'details') as string,
        detailsObject: JSON.parse(_.get(hat, 'detailsMetadata') as string),
      };
    },
  );

  const { data: orgChartWearers } = useTreeWearers({
    hats: hatDetails,
    chainId,
    editMode,
  });

  const { data: imagesData, isLoading: imagesLoading } = useTreeImages({
    hats: hatDetails,
    editMode,
  });

  const { orgChartTree } = useOrgChartTree({
    treeData,
    chainId,
    hatsData: hatDetails,
    detailsData: detailsFields,
    orgChartWearers,
    imagesData,
    draftHats,
    imagesLoaded: !imagesLoading,
    detailsLoaded: true,
    initialHatIds: _.map(onchainHats, 'id'),
    editMode,
  });
  // console.log(orgChartTree);

  // *********************
  // * TREE TOGGLE (INACTIVE HATS + OVERRIDE WITH CURRENT IMAGE AND NAME)
  // *********************

  const inactiveHats = useMemo(() => {
    return getInactiveIds(orgChartTree || undefined);
  }, [orgChartTree]);

  const transformTree = useCallback(
    (tree: any, includeInactive = false) => {
      return _.chain(tree)
        .filter(
          (hat: any) =>
            includeInactive || !_.includes(inactiveHats, _.get(hat, 'id')),
        )
        .map((hat: any) => {
          if (editMode) {
            const matchingHat = _.find(storedData, { id: hat.id }) || {};
            return {
              ...hat,
              displayName: matchingHat.name || hat.displayName,
              imageUrl: matchingHat.imageUrl || hat.imageUrl,
            };
          }
          return hat;
        })
        .filter(
          (hat: any) => !editMode || hat.id?.startsWith(treeData?.id || ''),
        )
        .value();
    },
    [storedData, inactiveHats, editMode, treeData],
  );

  const filteredTree = useMemo(
    () => (showInactiveHats ? orgChartTree : transformTree(orgChartTree)),
    [showInactiveHats, orgChartTree, transformTree],
  );

  const treeToDisplay: AppHat[] | undefined = useMemo(
    () =>
      (editMode ? transformTree(filteredTree, true) : filteredTree) as
        | AppHat[]
        | undefined,
    [editMode, filteredTree, transformTree],
  );

  const treeToDisplayWithInactiveHats = useMemo(
    () => transformTree(orgChartTree, true),
    [transformTree, orgChartTree],
  );

  // *********************
  // * TOP HAT
  // *********************

  const topHat: AppHat | undefined = useMemo(
    () => _.first(orgChartTree),
    [orgChartTree],
  );

  const topHatDetails = useMemo(
    () => _.get(topHat, 'detailsObject.data'),
    [topHat],
  );

  // *********************
  // * TREE-LEVEL AUTHORITY DATA
  // *********************

  const { data: guildData } = useTreeGuilds({
    orgChartTree,
    chainId,
    editMode,
  });
  const { data: snapshotData } = useTreeSnapshotSpaces({
    orgChartTree,
    chainId,
    editMode,
  });

  // *********************
  // * CHART ACTIONS
  // *********************

  /**
   * **Flip the Org Chart**
   *
   * After handling the disclosure, update the query params and local storage
   * to reflect the flipped state of the Org Chart.
   * @param isFlipped - The current state of `flipped` param in the Org Chart
   */
  const handleFlipChart = useCallback(
    (isFlipped: boolean) => {
      const url = urlFromQueryParams({
        pathname,
        params: queryParams,
        add: !isFlipped ? { flipped: true } : {},
        drop: isFlipped ? ['flipped'] : [],
      });

      window.history.pushState({}, '', url);

      setStoredConfig({
        ...storedConfig,
        flipped: isFlipped,
      });
    },
    [pathname, queryParams, setStoredConfig, storedConfig],
  );

  const updateCollapsedQueryParams = useCallback(
    (collapsed: any[]) => {
      console.log(collapsed);
      const url = urlFromQueryParams({
        pathname,
        params: queryParams,
        add: !_.isEmpty(collapsed) ? { collapsed } : {},
        drop: _.isEmpty(collapsed) ? ['collapsed'] : [],
      });

      window.history.pushState({}, '', url);

      setStoredConfig({
        ...storedConfig,
        collapsed: _.isArray(collapsed) ? collapsed : [collapsed],
      });
    },
    [pathname, queryParams, storedConfig, setStoredConfig],
  );

  /**
   * Update the `collapsed` query params and local storage.
   *
   * If query params are not empty, then they will take precedence over the local storage state, meaning that the local storage
   * will be updated according to the query params.
   *
   * If query params are empty but local storage is not, then the local storage will
   * take precedence.
   * @param nodeIdIp - The node ID of the collapsed or expanded node
   * @param expanded - The state of the node, expanded or collapsed
   */
  const handleNodeCollapsedOrExpanded = useCallback(
    (nodeIdIp: string, expanded: boolean) => {
      const { collapsed } = queryParams;
      console.log({ nodeIdIp, expanded, collapsed });

      if (Array.isArray(collapsed)) {
        console.log('collapsed is array');
        // existing query params is an array
        updateCollapsedQueryParams(
          expanded
            ? _.reject(collapsed, (id) => id === nodeIdIp)
            : _.uniq(_.concat(collapsed, nodeIdIp)),
        );
        return;
      }
      if (typeof collapsed === 'string') {
        // single collapsed node in query params
        console.log('collapsed is string');

        updateCollapsedQueryParams(
          expanded
            ? _.reject(collapsed, nodeIdIp)
            : _.uniq(_.concat(collapsed, nodeIdIp)),
        );
        return;
      }
      if (storedConfig.collapsed && !_.isEmpty(storedConfig.collapsed)) {
        console.log('collapsed in local storage');
        // no query params but there are collapsed nodes in local storage

        if (expanded) {
          updateCollapsedQueryParams(
            _.uniq(_.concat(storedConfig.collapsed, nodeIdIp)),
          );
          return;
        }

        if (_.includes(storedConfig.collapsed, nodeIdIp)) {
          updateCollapsedQueryParams(
            _.reject(storedConfig.collapsed, (id) => id === nodeIdIp),
          );
          return;
        }
        // update the query params with the including collapsed nodes from local storage
      }
      // no query params and no local storage, a node was collapsed
      updateCollapsedQueryParams([nodeIdIp]);
    },
    [queryParams, storedConfig, updateCollapsedQueryParams],
  );

  /**
   * Expand all nodes in the Org Chart
   *
   * Remove the `collapsed` query param and update the local storage
   * to reflect the expanded state of the Org Chart.
   */
  const handleExpandAll = useCallback(() => {
    const url = urlFromQueryParams({
      pathname,
      params: queryParams,
      drop: ['collapsed'],
    });

    window.history.pushState({}, '', url);

    setStoredConfig({
      ...storedConfig,
      collapsed: [],
    });
  }, [pathname, queryParams, setStoredConfig, storedConfig]);

  /**
   * Update the query params and local storage to reflect the current state of the Org Chart.
   *
   * @param isCompact - The current state compact param for the Org Chart
   */
  const handleSetCompact = useCallback(
    (isCompact: boolean) => {
      const url = urlFromQueryParams({
        pathname,
        params: queryParams,
        add: !isCompact ? { compact: true } : {},
        drop: isCompact ? ['compact'] : [],
      });

      window.history.pushState({}, '', url);

      setStoredConfig({
        ...storedConfig,
        compact: isCompact,
      });
    },
    [queryParams, pathname, setStoredConfig, storedConfig],
  );

  const toggleEditMode = useCallback(() => {
    if (!editMode) {
      const localDraftHats = _.reject(
        storedData,
        (hat: Partial<FormData>) =>
          _.includes(_.map(onchainHats, 'id'), hat.id) ||
          _.isEmpty(_.reject(hat, ['id', 'parentId'])),
      );
      if (!_.isEmpty(localDraftHats) && chainId && treeId) {
        const drafts = translateDrafts({
          chainId,
          treeId,
          drafts: localDraftHats,
        });
        setOrgChartHats(_.concat(onchainHats, drafts));
      }
      if (!hatId) onOpenTreeDrawer?.();
    } else {
      onCloseTreeDrawer?.();
      setOrgChartHats(onchainHats);
    }
    setEditMode(!editMode);
    // TODO need to reset selectedHatId? query update handles?
    // const updatedQuery = editMode
    //   ? _.omit(router.query, 'hatId')
    //   : router.query;
    // router.push({ pathname: router.pathname, query: updatedQuery }, undefined, {
    //   shallow: true,
    // });

    setSelectedOption?.('wearers');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onchainHats, editMode, storedData, chainId, treeId]);

  const addHat = useCallback(
    (hat: AppHat, parentId: Hex) => {
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

      // any way to get this to stick? always reverts to parent
      // router.push(updatedUrl, undefined, { shallow: true });
    },
    [editMode, storedData, setStoredData],
  );

  const removeHat = useCallback(
    (hId: Hex) => {
      setStoredData((prev) => {
        const tempData = _.cloneDeep(prev);
        if (!tempData) return [];
        const result = removeAndHandleSiblings(tempData, hId);
        return result;
      });
      setOrgChartHats((prev) => {
        const tempHats = _.cloneDeep(prev);
        if (!tempHats) return [];
        const result = removeAndHandleSiblingsOrgChart(tempHats, hId);
        return result;
      });
      onOpenTreeDrawer?.();
    },
    [setStoredData, onOpenTreeDrawer],
  );

  // HatExport[] -> FormData[]
  const importHats = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (hats: any[]) => {
      const translateImageUrl = _.map(hats, (hat: any) => {
        // don't try to compute image url if imageUri is empty
        const imageUrl = hat.imageUri
          ? { imageUrl: ipfsUrl(hat.imageUri?.slice(7)) }
          : {};
        return {
          ...hat,
          ...imageUrl,
        };
      });
      // ignore wearers on import
      const removeWearers = _.map(translateImageUrl, (hat: any) => {
        return _.omit(hat, ['wearers']);
      });
      setStoredData?.(removeWearers);
      const localDraftHats = _.reject(
        translateImageUrl,
        (hat: AppHat) =>
          _.includes(_.map(onchainHats, 'id'), hat.id) ||
          _.isEmpty(_.reject(hat, ['id', 'parentId'])),
      );
      if (!_.isEmpty(localDraftHats) && chainId && treeId) {
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
    onCloseHatDrawer?.();
    setSelectedOption?.('wearers');
    onCloseTreeDrawer?.();
    handleExpandAll();
  }, [
    onchainHats,
    setStoredData,
    onCloseHatDrawer,
    setSelectedOption,
    onCloseTreeDrawer,
    handleExpandAll,
  ]);

  const patchTree = useCallback((proposedHats: AppHat[]) => {
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

  const returnToTreeList = useCallback(() => {
    onOpenTreeDrawer?.();
    onCloseHatDrawer?.();
  }, [onOpenTreeDrawer, onCloseHatDrawer]);

  const returnValue = useMemo(
    () => ({
      chainId,
      treeId,
      topHat,
      // TREE
      topHatDetails,
      treeToDisplay,
      treeToDisplayWithInactiveHats,
      onchainTree: onchainTree || undefined,
      onchainHats,
      treeEvents,
      isLoading: treeLoading, //  || imagesLoading || detailsFieldsLoading, // orgChartTreeLoading,
      linkRequestFromTree,
      linkedHatIds,
      orgChartWearers,
      inactiveHats,
      orgChartTree: orgChartTree || undefined,
      guildData,
      snapshotData,
      treeError,
      // LOCAL STORAGE
      storedConfig,
      storedData,
      setStoredData,
      // CONTROLS
      editMode,
      setEditMode,
      toggleEditMode,
      selectedOption,
      setSelectedOption,
      showInactiveHats,
      setShowInactiveHats,
      // ACTIONS
      handleFlipChart,
      handleSetCompact,
      handleNodeCollapsedOrExpanded,
      handleExpandAll,
      addHat,
      removeHat,
      resetTree,
      importHats,
      patchTree,
      // DISCLOSURE
      isTreeDrawerOpen,
      onOpenTreeDrawer,
      onCloseTreeDrawer,
      isHatDrawerOpen,
      onOpenHatDrawer,
      onCloseHatDrawer,
      returnToTreeList,
    }),
    [
      chainId,
      treeId,
      topHat,
      // TREE
      topHatDetails,
      treeToDisplay,
      treeToDisplayWithInactiveHats,
      onchainTree,
      onchainHats,
      treeEvents,
      treeLoading,
      linkRequestFromTree,
      linkedHatIds,
      orgChartWearers,
      inactiveHats,
      orgChartTree,
      guildData,
      snapshotData,
      treeError,
      // LOCAL STORAGE
      storedData,
      storedConfig,
      setStoredData,
      // CONTROLS
      editMode,
      setEditMode,
      toggleEditMode,
      selectedOption,
      setSelectedOption,
      showInactiveHats,
      setShowInactiveHats,
      // ACTIONS
      handleFlipChart,
      handleSetCompact,
      handleNodeCollapsedOrExpanded,
      handleExpandAll,
      addHat,
      removeHat,
      resetTree,
      importHats,
      patchTree,
      // DISCLOSURE
      isTreeDrawerOpen,
      onOpenTreeDrawer,
      onCloseTreeDrawer,
      isHatDrawerOpen,
      onOpenHatDrawer,
      onCloseHatDrawer,
      returnToTreeList,
    ],
  );

  return (
    <TreeFormContext.Provider value={returnValue}>
      {children}
    </TreeFormContext.Provider>
  );
};

export const useTreeForm = () => useContext(TreeFormContext);
