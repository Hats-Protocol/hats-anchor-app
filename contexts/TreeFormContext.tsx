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
import { generateLocalStorageKey, mapWithChainId } from '@/lib/general';
import {
  checkImageForHat,
  createHierarchy,
  ipToHatId,
  translateDrafts,
} from '@/lib/hats';
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
  onchainTree: Tree | undefined;
  onchainHats: Hat[] | undefined;
  treeEvents: HatEvent[] | undefined;
  isLoading: boolean;
  linkRequestFromTree: LinkRequest[] | undefined;
  // local storage
  storedData: Partial<FormData>[] | undefined;
  setStoredData: ((v: Partial<FormData>[]) => void) | undefined;
  newImageUrls: {
    id: `0x${string}` | undefined;
    newImageUrl: string | null | undefined;
  }[];
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
  resetTree: (() => void) | undefined;
  importHats: ((hats: Partial<FormData>[]) => void) | undefined;
  // disclosures
  hatDisclosure: UseDisclosureReturn | undefined;
  treeDisclosure: UseDisclosureReturn | undefined;
  patchTree: ((proposedHats: Hat[]) => void) | undefined;
  hierarchy: Hierarchy | undefined;
}

export const treeFormContext = createContext<TreeFormContext>({
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
  // initialHatIds,
  children,
}: {
  treeId: Hex;
  chainId: number;
  initialHatId: string | undefined;
  initialTreeData: Tree;
  // initialHatIds: Hex[];
  children: ReactNode;
}) => {
  const onchainTree = useRef(initialTreeData);
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

  const { onOpen: onOpenHatDrawer } = hatDisclosure;
  const { onOpen: onOpenTreeDrawer, onClose: onCloseTreeDrawer } =
    treeDisclosure;

  // existing tree
  const { data: treeData } = useTreeDetails({
    treeId,
    chainId,
    initialData: initialTreeData,
  });
  const treeEvents = _.get(treeData, 'events');
  const onchainHats = useMemo(() => {
    return _.compact(
      _.concat(
        _.get(treeData, 'hats'),
        _.get(initialTreeData, 'parentOfHats') || [],
        _.get(initialTreeData, 'linkedToHat') || [],
      ),
    );
  }, [treeData, initialTreeData]);
  const linkRequestFromTree = _.get(treeData, 'linkRequestFromTree');

  useEffect(() => {
    setOrgChartHats(
      _.compact(
        _.concat(
          _.get(treeData, 'hats'),
          _.get(treeData, 'parentOfHats', []),
          _.get(treeData, 'linkedToHat', []),
        ),
      ),
    );
  }, [treeData]);

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

  const { data: hatDetails } = useManyHatDetails({
    hats: mapWithChainId(orgChartHats, chainId),
    initialHats: onchainHats,
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
    initialHatIds: _.map(onchainHats, 'id'),
  });

  const storedHatsWithImage = useMemo(() => {
    return (storedData || []).filter((hat) => Boolean(hat.imageUrl));
  }, [storedData]);

  const queries = storedHatsWithImage.map((hat) => ({
    queryKey: ['newImageURI', hat.imageUrl],
    queryFn: () => checkImageForHat(hat?.imageUrl),
    enabled: true,
    timeout: 5000,
  }));

  const results = useQueries({ queries });

  const newImageUrls = useMemo(() => {
    return results.map((result, index) => ({
      id: storedHatsWithImage[index].id,
      newImageUrl: result.data,
    }));
  }, [results, storedHatsWithImage]);

  const filteredTree = useMemo(() => {
    if (showInactiveHats) return orgChartTree;

    const inactiveHats = _.map(
      _.filter(orgChartTree, ['status', false]),
      (h) => {
        const prettyId = _.get(h, 'prettyId');
        if (!prettyId) return '';
        return _.replace(prettyId, '.', '');
      },
    );
    const inactiveAncestors = _.filter(orgChartTree, (hat) =>
      _.some(inactiveHats, (h) => hat.id.includes(h)),
    );

    return _.reject(orgChartTree, (h) =>
      _.includes(_.map(inactiveAncestors, 'id'), h.id),
    );
  }, [orgChartTree, showInactiveHats]);

  const updatedTree = useMemo(() => {
    return _.map(filteredTree, (hat) => {
      const newImageUrl = _.find(newImageUrls, ['id', hat.id])?.newImageUrl;
      const newName = _.find(storedData, ['id', hat.id])?.name;
      return {
        ...hat,
        newName,
        newImageUrl,
      };
    });
  }, [filteredTree, newImageUrls, storedData]);

  const treeToDisplay = useMemo(() => {
    return editMode ? updatedTree : filteredTree;
  }, [editMode, updatedTree, filteredTree]);

  // top hat
  const topHat: Hat | undefined = useMemo(
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
          // const newImageUrl = _.find(newImageUrls, ['id', existingHat.id]);
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
      treeToDisplay,
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
      treeToDisplay,
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
    <treeFormContext.Provider value={returnValue}>
      {children}
    </treeFormContext.Provider>
  );
};

export const useTreeForm = () => useContext(treeFormContext);
