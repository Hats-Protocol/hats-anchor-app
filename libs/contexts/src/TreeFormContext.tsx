import { useDisclosure, UseDisclosureReturn } from '@chakra-ui/react';
import { DEFAULT_HAT } from '@hatsprotocol/constants';
import { HatsEvent } from '@hatsprotocol/sdk-v1-subgraph';
import {
  useManyHatsDetails,
  useManyHatsDetailsField,
  useTreeDetails,
  useWearersControllersDetails,
} from 'hats-hooks';
import { translateDrafts } from 'hats-utils';
import {
  useImageURIs,
  useLocalStorage,
  useOrgChartTree,
  useTreeImages,
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
import { createHierarchy, ipToHatId, mapWithChainId } from 'shared';
import {
  AppHat,
  FormData,
  HatDetails,
  HatWearer,
  Hierarchy,
  LinkRequest,
  SupportedChains,
} from 'types';
import {
  generateLocalStorageKey,
  ipfsUrl,
  removeAndHandleSiblings,
  removeAndHandleSiblingsOrgChart,
} from 'utils';
import { Hex } from 'viem';

import { useSelectedHat } from './SelectedHatContext';

export interface TreeFormContext {
  chainId: SupportedChains | undefined;
  treeId: Hex | undefined;
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
  wearersAndControllers: HatWearer[] | undefined;
  inactiveHats: string[] | undefined;
  orgChartTree: AppHat[] | undefined;
  // local storage
  storedConfig: { flipped?: boolean; compact?: boolean };
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
  removeHat: ((hatId: Hex) => void) | undefined;
  resetTree: (() => void) | undefined;
  importHats: ((hats: Partial<FormData>[]) => void) | undefined;
  // disclosures
  treeDisclosure: UseDisclosureReturn | undefined;
  patchTree: ((proposedHats: AppHat[]) => void) | undefined;
  hierarchy: Hierarchy | undefined;
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
  wearersAndControllers: undefined,
  inactiveHats: undefined,
  // local storage
  storedConfig: {},
  storedData: undefined,
  setStoredData: undefined,
  orgChartTree: undefined,
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
  addHat: undefined,
  removeHat: undefined,
  resetTree: undefined,
  importHats: undefined,
  // disclosures
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
  const {
    selectedHatDetails,
    isDraft,
    selectedOnchainHat,
    selectedOnchainHatDetails,
    selectedHatGuildRoles,
    selectedHatSpaces,
    combinedAuthorities,
    selectedHat,
    setSelectedHatId,
    handleSelectHat,
    hatDisclosure,
  } = useSelectedHat();

  const { hatId: initialHatIdParam } = router.query;
  let initialHatId: string | undefined;
  if (_.isArray(initialHatIdParam)) {
    initialHatId = _.first(initialHatId);
  } else {
    initialHatId = initialHatIdParam as string;
  }

  const [editMode, setEditMode] = useState(false);
  const [showInactiveHats, setShowInactiveHats] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    'wearers',
  );
  const [orgChartHats, setOrgChartHats] = useState<AppHat[] | undefined>();

  const localStorageKey = generateLocalStorageKey(chainId, treeId);
  const [storedData, setStoredData] = useLocalStorage<Partial<FormData>[]>(
    localStorageKey,
    [],
  );
  const [storedConfig, setStoredConfig] = useLocalStorage(
    `${localStorageKey}-config`,
    {},
  );

  const treeDisclosure = useDisclosure();
  const { onOpen: onOpenTreeDrawer, onClose: onCloseTreeDrawer } =
    treeDisclosure;
  const onCloseHatDrawer = hatDisclosure?.onClose;

  // existing tree
  const { data: treeData } = useTreeDetails({
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
  const { data: imagesData, isLoading: imagesLoading } = useTreeImages({
    hats: hatDetails,
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
  const inactiveHats = useMemo(
    () =>
      _.compact(_.map(_.filter(orgChartTree, ['status', false]), 'prettyId')),
    [orgChartTree],
  );

  const transformTree = useCallback(
    (tree, includeInactive = false) => {
      return _.chain(tree)
        .filter(
          (hat) =>
            includeInactive ||
            !_.includes(inactiveHats, _.get(hat, 'prettyId')),
        )
        .map((hat) => {
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
        .filter((hat) => !editMode || hat.id?.startsWith(treeData?.id || ''))
        .value();
    },
    [storedData, inactiveHats, editMode, treeData],
  );

  const filteredTree = useMemo(
    () => (showInactiveHats ? orgChartTree : transformTree(orgChartTree)),
    [showInactiveHats, orgChartTree, transformTree],
  );

  const treeToDisplay = useMemo(
    () => (editMode ? transformTree(filteredTree, true) : filteredTree),
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
  // * CHART ACTIONS
  // *********************

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

      setStoredConfig({
        ...storedConfig,
        flipped: isFlipped,
      });
    },
    [router, setStoredConfig, storedConfig],
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

      setStoredConfig({
        ...storedConfig,
        compact: isCompact,
      });
    },
    [router, setStoredConfig, storedConfig],
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
    setSelectedHatId?.(undefined);
    const updatedQuery = _.omit(router.query, 'hatId');
    router.push({ pathname: router.pathname, query: updatedQuery }, undefined, {
      shallow: true,
    });
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
      onOpenTreeDrawer();
      onCloseHatDrawer?.();
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
        (hat: AppHat) =>
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
    setSelectedHatId?.(undefined);
    setSelectedOption?.('wearers');
    onCloseTreeDrawer();
  }, [
    onchainHats,
    setStoredData,
    setSelectedHatId,
    setSelectedOption,
    onCloseTreeDrawer,
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

  const hierarchy = useMemo(() => {
    const parentsAndIds = _.map(orgChartTree, (hat: AppHat) => ({
      id: hat.id,
      parentId: hat.admin?.id,
    }));
    return createHierarchy(parentsAndIds, selectedHat?.id);
  }, [orgChartTree, selectedHat]);

  useEffect(() => {
    if (initialHatId && orgChartTree) {
      handleSelectHat?.(ipToHatId(String(initialHatId)));
    }
  }, [initialHatId, orgChartTree, handleSelectHat]);

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
      treeToDisplayWithInactiveHats,
      onchainTree,
      onchainHats,
      treeEvents,
      isLoading: imagesLoading || detailsFieldsLoading,
      linkRequestFromTree,
      linkedHatIds,
      wearersAndControllers,
      inactiveHats,
      orgChartTree,
      // local storage
      storedConfig,
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
      treeToDisplayWithInactiveHats,
      onchainTree,
      onchainHats,
      treeEvents,
      imagesLoading,
      detailsFieldsLoading,
      linkRequestFromTree,
      linkedHatIds,
      wearersAndControllers,
      inactiveHats,
      orgChartTree,
      // local storage
      storedData,
      storedConfig,
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
