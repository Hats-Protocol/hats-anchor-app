import { useDisclosure, UseDisclosureReturn } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import router from 'next/router';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Hex } from 'viem';

import { defaultHat } from '@/constants';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useImageURIs from '@/hooks/useImageURIs';
import useLocalStorage from '@/hooks/useLocalStorage';
import useManyHatDetails from '@/hooks/useManyHatsDetails';
import useManyHatsDetailsField from '@/hooks/useManyHatsDetailsField';
import useOrgChartTree from '@/hooks/useOrgChartTree';
import useTreeDetails from '@/hooks/useTreeDetails';
import useWearersControllersDetails from '@/hooks/useWearersControllersDetails';
import {
  removeAndHandleSiblings,
  removeAndHandleSiblingsOrgChart,
} from '@/lib/form';
import { generateLocalStorageKey, mapWithChainId } from '@/lib/general';
import { createHierarchy, ipToHatId, translateDrafts } from '@/lib/hats';
import { ipfsUrl } from '@/lib/ipfs';
import {
  FormData,
  Hat,
  HatDetails,
  HatEvent,
  Hierarchy,
  LinkRequest,
  Tree,
} from '@/types';

export interface TreeFormContext {
  chainId: number | undefined;
  treeId: Hex | undefined;
  topHat: Hat | undefined;
  // tree
  topHatDetails: HatDetails | undefined;
  selectedHatDetails: HatDetails | undefined;
  isDraft: boolean;
  treeToDisplay: Hat[] | undefined;
  onchainTree: Hat[] | undefined;
  onchainHats: Hat[] | undefined;
  onchainHatsWithDetails: Hat[] | undefined;
  selectedOnchainHat: Hat | undefined;
  selectedOnchainHatDetails: HatDetails | undefined;
  treeEvents: HatEvent[] | undefined;
  isLoading: boolean;
  linkRequestFromTree: LinkRequest[] | undefined;
  linkedHatIds?: Hex[];
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
  addHat: ((hat: Hat) => void) | undefined;
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
  onchainHatsWithDetails: undefined,
  selectedOnchainHat: undefined,
  selectedOnchainHatDetails: undefined,
  treeEvents: undefined,
  isLoading: true,
  linkRequestFromTree: undefined,
  linkedHatIds: undefined,
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
  initialHatId,
  initialTreeData,
  linkedHatIds,
  children,
}: {
  treeId: Hex;
  chainId: number;
  initialHatId: string | undefined;
  initialTreeData: Tree;
  linkedHatIds: Hex[] | undefined;
  children: ReactNode;
}) => {
  const initialTopHat = _.first(_.get(initialTreeData, 'hats'));
  const [selectedHatId, setSelectedHatId] = useState<Hex | undefined>(
    ipToHatId(initialHatId) || _.get(initialTopHat, 'id'),
  );
  const [editMode, setEditMode] = useState(false);
  const [showInactiveHats, setShowInactiveHats] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    'wearers',
  );
  const [orgChartHats, setOrgChartHats] = useState<Hat[] | undefined>(
    _.concat(
      _.get(initialTreeData, 'hats'),
      _.get(initialTreeData, 'parentOfHats') || [],
      _.get(initialTreeData, 'linkedToHat') || [],
    ),
  );
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
    initialData: initialTreeData,
    editMode,
  });
  const treeEvents = _.get(treeData, 'events');

  const { data: onchainLinkedHats } = useManyHatDetails({
    hats: mapWithChainId(
      _.map(linkedHatIds, (id) => ({ id })),
      chainId,
    ),
    initialHats: _.map(linkedHatIds, (id) => ({ id })),
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
        (hat) =>
          _.includes(_.map(onchainHats, 'id'), _.get(hat, 'id')) ||
          _.isEmpty(_.reject(hat, ['id', 'parentId'])),
      ),
    [onchainHats, orgChartHats],
  );

  // *********************
  // * ONCHAIN TREE (ONCHAIN HATS)
  // *********************
  const onchainIds = _.map(onchainHats, ({ id }) => ({ id }));
  const { data: onchainHatDetails } = useManyHatDetails({
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
  const onchainHatsWithDetails = useMemo(() => {
    return _.map(_.get(initialTreeData, 'hats'), (hat) => {
      const details = _.find(onchainDetailsFields, { id: hat.details });
      return { ...hat, detailsObject: details?.detailsObject };
    });
  }, [initialTreeData, onchainDetailsFields]);
  const onchainWearersAndControllers = useWearersControllersDetails({
    hats: onchainHatDetails,
    editMode,
    onchain: true,
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
    wearersAndControllers: onchainWearersAndControllers,
    imagesData: onchainImagesData,
    draftHats,
    imagesLoaded: !onchainImagesLoading,
    detailsLoaded: !onchainDetailsFieldsLoading,
    initialHatIds: _.map(onchainHats, 'id'),
    editMode,
  });

  // *********************
  // * TREE TO DISPLAY (ORG CHART HATS)
  // *********************
  const { data: hatDetails } = useManyHatDetails({
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
    wearersAndControllers,
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
      (h) => {
        return _.get(h, 'prettyId');
      },
    );
    const inactiveAncestors = _.map(
      _.filter(orgChartTree, (hat) =>
        _.some(inactiveHats, (h) => h && hat.prettyId?.includes(h)),
      ),
      'prettyId',
    );

    return _.reject(orgChartTree, (h) =>
      _.includes(_.concat(inactiveHats, inactiveAncestors), h.prettyId),
    );
  }, [orgChartTree, showInactiveHats]);
  const overrideOrgChartData = useMemo(() => {
    return _.map(filteredTree, (hat) => {
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
      ({ id }) => treeData?.id && !id.startsWith(treeData?.id),
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
  const selectedHat = useMemo(
    () => _.find(orgChartTree, ['id', selectedHatId]),
    [orgChartTree, selectedHatId],
  );
  const selectedHatDetails = useMemo(
    () => _.get(selectedHat, 'detailsObject.data'),
    [selectedHat],
  );
  // selected onchain hat
  const selectedOnchainHat = useMemo(
    () => _.find(onchainHatDetails, ['id', selectedHatId]),
    [onchainHatDetails, selectedHatId],
  );
  const selectedOnchainHatDetails = useMemo(
    () =>
      _.get(
        _.find(onchainHatsWithDetails, ['id', selectedHatId]),
        'detailsObject.data',
      ),
    [onchainHatsWithDetails, selectedHatId],
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
      const allIds = _.map(orgChartTree, 'id');
      if (!_.includes(allIds, id)) return;

      setSelectedHatId(id);

      const updatedQuery = {
        ...router.query,
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
    [orgChartTree, isMobile],
  );

  const handleFlipChart = useCallback((isFlipped: boolean) => {
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
  }, []);

  const handleSetCompact = useCallback((isCompact: boolean) => {
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
  }, []);

  const toggleEditMode = useCallback(() => {
    if (!editMode) {
      const localDraftHats = _.reject(
        storedData,
        (hat) =>
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

  const addHat = useCallback((hat: Hat) => {
    // set updated tree array
    const newHat = {
      ...defaultHat,
      ...hat,
    };
    setOrgChartHats((prev) => {
      const tempHats = _.cloneDeep(prev);
      if (!tempHats) return [];
      return _.concat(tempHats, [newHat]);
    });

    // update query param to open drawer
    const updatedQuery = {
      ...router.query,
      hatId: hatIdDecimalToIp(BigInt(hat.id)),
    };
    router.push({ pathname: router.pathname, query: updatedQuery }, undefined, {
      shallow: true,
    });
  }, []);

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

  const importHats = useCallback(
    (hats: Partial<FormData>[]) => {
      setStoredData?.(hats);
      const localDraftHats = _.reject(
        hats,
        (hat) =>
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

  const patchTree = useCallback(
    (proposedHats: Hat[]) => {
      setOrgChartHats((prevHats) => {
        if (!prevHats) return [];

        return _.map(prevHats, (existingHat) => {
          const proposedHat = _.find(proposedHats, ['id', existingHat.id]);
          // wearers is coming in as 'wearer'
          const newName = _.find(storedData, ['id', existingHat.id])?.name;

          if (proposedHat) {
            return {
              ...existingHat,
              ...proposedHat,
              imageUri: proposedHat?.imageUri || existingHat.imageUri || '',
              imageUrl: ipfsUrl(
                proposedHat?.imageUri?.slice(7) ||
                  existingHat.imageUri?.slice(7),
              ),
              name: newName || existingHat.name,
            };
          }
          return existingHat;
        });
      });
    },
    [storedData],
  );

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
      onchainHatsWithDetails,
      treeEvents,
      isLoading: imagesLoading || detailsFieldsLoading,
      linkRequestFromTree,
      linkedHatIds,
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
      onchainHatsWithDetails,
      treeEvents,
      imagesLoading,
      detailsFieldsLoading,
      linkRequestFromTree,
      linkedHatIds,
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
