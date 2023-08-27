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
  useRef,
  useState,
} from 'react';
import { Hex } from 'viem';

import { defaultHat } from '@/constants';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useImageURIs from '@/hooks/useImageURIs';
import useLocalStorage from '@/hooks/useLocalStorage';
import useOrgChartTree from '@/hooks/useOrgChartTree';
import useTreeDetails from '@/hooks/useTreeDetails';
import { generateLocalStorageKey } from '@/lib/general';
import { ipToHatId, translateDrafts } from '@/lib/hats';
import { FormData, HatDetails, IHat, IHatEvent, ITree } from '@/types';

export interface ITreeFormContext {
  chainId: number | undefined;
  treeId: Hex | undefined;
  topHat: IHat | undefined;
  // tree
  topHatDetails: HatDetails | undefined;
  selectedHatDetails: HatDetails | undefined;
  orgChartTree: IHat[] | undefined;
  onchainTree: ITree | undefined;
  onchainHats: IHat[] | undefined;
  treeEvents: IHatEvent[] | undefined;
  isLoading: boolean;
  // local storage
  storedData: Partial<FormData>[] | undefined;
  setStoredData: ((v: Partial<FormData>[]) => void) | undefined;
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
  // disclosures
  hatDisclosure: UseDisclosureReturn | undefined;
  treeDisclosure: UseDisclosureReturn | undefined;
}

export const TreeFormContext = createContext<ITreeFormContext>({
  chainId: undefined,
  treeId: undefined,
  topHat: undefined,
  // tree
  topHatDetails: undefined,
  selectedHatDetails: undefined,
  orgChartTree: undefined,
  onchainTree: undefined,
  onchainHats: undefined,
  treeEvents: undefined,
  isLoading: true,
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
  addHat: undefined,
  // disclosures
  hatDisclosure: undefined,
  treeDisclosure: undefined,
});

export const TreeFormContextProvider = ({
  treeId,
  chainId,
  initialHatId,
  initialTreeData,
  children,
}: {
  treeId: Hex;
  chainId: number;
  initialHatId: string | undefined;
  initialTreeData: ITree;
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
    _.get(initialTreeData, 'hats'),
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

  const { data: treeData } = useTreeDetails({
    treeId,
    chainId,
    initialData: initialTreeData,
  });

  const { data: hatsWithImageData, isLoading: imagesDataLoading } =
    useImageURIs(orgChartHats, chainId);

  const { orgChartTree } = useOrgChartTree({
    treeData,
    chainId,
    hatsWithImageData,
  });

  // top hat
  const topHat: IHat | null | undefined = useMemo(
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

  // existing tree
  const treeEvents = _.get(onchainTree.current, 'events');
  const onchainHats = _.get(onchainTree.current, 'hats');
  // ? const linkRequestFromTree = _.get(treeData, 'linkRequestFromTree');

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
      const draftHats = _.reject(
        storedData,
        (hat) =>
          _.includes(_.map(onchainHats, 'id'), hat.id) ||
          _.isEmpty(_.reject(hat, ['id', 'parentId'])),
      );
      if (!_.isEmpty(draftHats)) {
        const drafts = translateDrafts({ chainId, treeId, drafts: draftHats });
        setOrgChartHats(_.concat(onchainHats, drafts));
        onOpenTreeDrawer();
      }
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
    setSelectedOption(editMode ? 'wearers' : 'title');
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
      orgChartTree,
      onchainTree: onchainTree.current,
      onchainHats,
      treeEvents,
      isLoading: imagesDataLoading,
      // local storage
      storedData,
      setStoredData,
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
      // disclosures
      hatDisclosure,
      treeDisclosure,
    }),
    [
      chainId,
      treeId,
      topHat,
      // tree
      topHatDetails,
      selectedHatDetails,
      orgChartTree,
      onchainTree,
      onchainHats,
      treeEvents,
      imagesDataLoading,
      // local storage
      storedData,
      setStoredData,
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
      // disclosures
      hatDisclosure,
      treeDisclosure,
    ],
  );

  return (
    <TreeFormContext.Provider value={returnValue}>
      {children}
    </TreeFormContext.Provider>
  );
};

export const useTreeForm = () => useContext(TreeFormContext);
