import { useDisclosure, UseDisclosureReturn } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useQueries } from '@tanstack/react-query';
import _ from 'lodash';
import router from 'next/router';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { generateLocalStorageKey } from '@/lib/general';
import {
  checkImageForHat,
  createHierarchy,
  ipToHatId,
  translateDrafts,
} from '@/lib/hats';
import {
  FormData,
  HatDetails,
  Hierarchy,
  IHat,
  IHatEvent,
  ITree,
  LinkRequest,
} from '@/types';

export interface ITreeFormContext {
  chainId: number | undefined;
  treeId: Hex | undefined;
  topHat: IHat | undefined;
  // tree
  topHatDetails: HatDetails | undefined;
  selectedHatDetails: HatDetails | undefined;
  isDraft: boolean;
  orgChartTree: IHat[] | undefined;
  onchainTree: ITree | undefined;
  onchainHats: IHat[] | undefined;
  treeEvents: IHatEvent[] | undefined;
  isLoading: boolean;
  linkRequestFromTree: LinkRequest[] | undefined;
  // local storage
  storedData: Partial<FormData>[] | undefined;
  setStoredData: ((v: Partial<FormData>[]) => void) | undefined;
  newImageUrls: {
    id: `0x${string}` | undefined;
    newImageUrl: void | undefined;
  }[];
  // controls
  editMode: boolean;
  setEditMode: ((v: boolean) => void) | undefined;
  toggleEditMode: (() => void) | undefined;
  selectedHat: IHat | undefined;
  setSelectedHatId: ((id: Hex | undefined) => void) | undefined;
  selectedOption: string | undefined;
  setSelectedOption: ((v: string) => void) | undefined;
  showInactiveHats: boolean;
  setShowInactiveHats: ((v: boolean) => void) | undefined;
  // actions
  addHat: ((hat: IHat) => void) | undefined;
  handleSelectHat: ((id: Hex) => void) | undefined;
  resetTree: (() => void) | undefined;
  importHats: ((hats: Partial<FormData>[]) => void) | undefined;
  // disclosures
  hatDisclosure: UseDisclosureReturn | undefined;
  treeDisclosure: UseDisclosureReturn | undefined;
  patchTree: ((proposedHats: IHat[]) => void) | undefined;
  hierarchy: Hierarchy | undefined;
}

export const TreeFormContext = createContext<ITreeFormContext>({
  chainId: undefined,
  treeId: undefined,
  topHat: undefined,
  // tree
  topHatDetails: undefined,
  selectedHatDetails: undefined,
  isDraft: false,
  orgChartTree: undefined,
  onchainTree: undefined,
  onchainHats: undefined,
  treeEvents: undefined,
  isLoading: true,
  linkRequestFromTree: undefined,
  // local storage
  storedData: undefined,
  setStoredData: undefined,
  newImageUrls: [],
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
  addHat: undefined,
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
  initialHatIds,
  children,
}: {
  treeId: Hex;
  chainId: number;
  initialHatId: string | undefined;
  initialTreeData: ITree;
  initialHatIds: Hex[];
  children: ReactNode;
}) => {
  const onchainTree = useRef(initialTreeData);
  const initialTopHat = _.first(_.get(initialTreeData, 'hats'));
  const [selectedHatId, setSelectedHatId] = useState<Hex | undefined>(
    ipToHatId(initialHatId) || _.get(initialTopHat, 'id'),
  );
  const [editMode, setEditMode] = useState(false);
  const [showInactiveHats, setShowInactiveHats] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    'wearers',
  );
  const [orgChartHats, setOrgChartHats] = useState<IHat[] | undefined>(
    _.get(initialTreeData, 'hats').concat(
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

  const { onOpen: onOpenHatDrawer } = hatDisclosure;
  const { onOpen: onOpenTreeDrawer, onClose: onCloseTreeDrawer } =
    treeDisclosure;

  // existing tree
  const treeEvents = _.get(onchainTree.current, 'events');
  const onchainHats = _.get(onchainTree.current, 'hats').concat(
    _.get(initialTreeData, 'parentOfHats') || [],
    _.get(initialTreeData, 'linkedToHat') || [],
  );

  const draftHats = useMemo(
    () =>
      _.reject(
        orgChartHats,
        (hat) =>
          _.includes(_.map(onchainHats, 'id'), hat.id) ||
          _.isEmpty(_.reject(hat, ['id', 'parentId'])),
      ),
    [onchainHats, orgChartHats],
  );

  const { data: treeData } = useTreeDetails({
    treeId,
    chainId,
    initialData: initialTreeData,
  });

  const hatDetails = useManyHatDetails({
    hats: _.map(orgChartHats, ({ id: hatId }) => ({
      id: hatId,
      chainId,
    })),
    initialHats: _.get(initialTreeData, 'hats'),
  });

  const { data: detailsFields, isLoading: detailsLoading } =
    useManyHatsDetailsField({
      hats: hatDetails,
      onchainHats,
    });

  const wearersAndControllers = useWearersControllersDetails({
    hats: hatDetails,
  });

  const { data: imagesData, isLoading: imagesLoading } = useImageURIs({
    hats: hatDetails,
    onchainHats,
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
    detailsLoaded: !detailsLoading,
    initialHatIds,
  });

  // top hat
  const topHat: IHat | undefined = useMemo(
    () => _.first(orgChartTree),
    [orgChartTree],
  );
  const topHatDetails = useMemo(
    () => _.get(topHat, 'detailsObject.data'),
    [topHat],
  );

  // selected hat
  const selectedHat = useMemo(
    () => _.find(orgChartTree, ['id', selectedHatId]),
    [orgChartTree, selectedHatId],
  );
  const selectedHatDetails = useMemo(
    () => _.get(selectedHat, 'detailsObject.data'),
    [selectedHat],
  );
  const isDraft = useMemo(
    () => !_.includes(_.map(onchainHats, 'id'), selectedHat?.id),
    [onchainHats, selectedHat],
  );

  // Filtering storedData to get hats with imageUrl
  const hatsWithImage = useMemo(() => {
    return (storedData || []).filter((hat) => Boolean(hat.imageUrl));
  }, [storedData]);

  // Creating queries for each hat with imageUrl
  const queries = useMemo(() => {
    return hatsWithImage.map((hat) => ({
      queryKey: ['newImageURI', hat.imageUrl],
      queryFn: () => {
        if (hat.imageUrl) checkImageForHat(hat.imageUrl);
      },
      enabled: Boolean(hat.imageUrl),
    }));
  }, [hatsWithImage]);

  const results = useQueries({ queries });

  // Mapping the results to get the desired array of objects with id and newImageUrl
  const newImageUrls = useMemo(() => {
    return results.map((result, index) => ({
      id: hatsWithImage[index].id,
      newImageUrl: result.data,
    }));
  }, [results, hatsWithImage]);

  // existing tree
  const linkRequestFromTree = _.get(treeData, 'linkRequestFromTree');

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

      onOpenHatDrawer();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgChartTree, isMobile],
  );

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

  const addHat = useCallback((hat: IHat) => {
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

  const patchTree = useCallback((proposedHats: IHat[]) => {
    setOrgChartHats((prevHats) => {
      if (!prevHats) return [];

      const proposedHatsMap = proposedHats.reduce<{ [id: string]: IHat }>(
        (acc, hat) => {
          acc[hat.id] = hat;
          return acc;
        },
        {},
      );

      return prevHats.map((existingHat) => {
        if (proposedHatsMap[existingHat.id]) {
          return {
            ...existingHat,
            ...proposedHatsMap[existingHat.id],
          };
        }
        return existingHat;
      });
    });
  }, []);

  const hierarchy = useMemo(() => {
    const parentsAndIds = _.map(orgChartTree, (hat: IHat) => ({
      id: hat.id,
      parentId: hat.admin?.id,
    }));
    return createHierarchy(parentsAndIds, selectedHat?.id);
  }, [orgChartTree, selectedHat]);

  useEffect(() => {
    if (initialHatId && orgChartTree) {
      handleSelectHat(ipToHatId(String(initialHatId)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHatId, orgChartTree]);

  const returnValue = useMemo(
    () => ({
      chainId,
      treeId,
      topHat,
      // tree
      topHatDetails,
      selectedHatDetails,
      isDraft,
      orgChartTree,
      onchainTree: onchainTree.current,
      onchainHats,
      treeEvents,
      isLoading: imagesLoading || detailsLoading,
      linkRequestFromTree,
      // local storage
      storedData,
      setStoredData,
      newImageUrls,
      // controls
      editMode,
      setEditMode,
      toggleEditMode,
      selectedHat,
      setSelectedHatId,
      selectedOption,
      setSelectedOption,
      showInactiveHats,
      setShowInactiveHats,
      // actions
      handleSelectHat,
      addHat,
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
      orgChartTree,
      onchainTree,
      onchainHats,
      treeEvents,
      imagesLoading,
      detailsLoading,
      linkRequestFromTree,
      // local storage
      storedData,
      setStoredData,
      newImageUrls,
      // controls
      editMode,
      setEditMode,
      toggleEditMode,
      selectedHat,
      setSelectedHatId,
      selectedOption,
      setSelectedOption,
      showInactiveHats,
      setShowInactiveHats,
      // actions
      handleSelectHat,
      addHat,
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
