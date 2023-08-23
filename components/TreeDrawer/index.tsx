import { Box } from '@chakra-ui/react';
import _ from 'lodash';
import { useAccount } from 'wagmi';

import useLocalStorage from '@/hooks/useLocalStorage';
import { generateLocalStorageKey } from '@/lib/general';
import { IHat } from '@/types';

import BottomMenu from './BottomMenu';
import MainContent from './MainContent';
import TopMenu from './TopMenu';

const TreeDrawer = ({
  editMode,
  setEditMode,
  onClose,
  tree,
  chainId,
  handleHatClick,
  treeId,
}: TreeDrawerProps) => {
  const { address } = useAccount();
  const localStorageKey = generateLocalStorageKey(chainId, treeId);
  const [storedData, setStoredData] = useLocalStorage<Partial<IHat>[]>(
    localStorageKey,
    [],
  );

  const topHat: IHat | undefined = _.find(tree, ['levelAtLocalTree', 0]);
  const wearingTopHat = _.includes(
    _.map(topHat?.wearers, 'id'),
    _.toLower(address),
  );
  console.log(wearingTopHat);

  return (
    <Box
      w='full'
      h='100%'
      borderLeft='1px solid'
      borderColor='gray.200'
      position='fixed'
      right={0}
      zIndex={12}
    >
      <TopMenu
        editMode={editMode}
        setEditMode={setEditMode}
        onClose={onClose}
        chainId={chainId}
        treeId={treeId}
        storedData={storedData}
        setStoredData={setStoredData}
        wearingTopHat={wearingTopHat}
      />
      <MainContent
        tree={tree}
        handleHatClick={handleHatClick}
        storedData={storedData}
      />
      <BottomMenu chainId={chainId} treeId={treeId} />
    </Box>
  );
};

export default TreeDrawer;

interface TreeDrawerProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  onClose: () => void;
  tree: IHat[];
  chainId: number;
  handleHatClick: (hatId: string) => void;
  treeId: string;
}
