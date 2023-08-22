import { Box } from '@chakra-ui/react';

import useLocalStorage from '@/hooks/useLocalStorage';
import { generateLocalStorageKey } from '@/lib/general';
import { IHat } from '@/types';

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
  const localStorageKey = generateLocalStorageKey(chainId, treeId);
  const [storedDataString, setStoredDataString] = useLocalStorage<string>(
    localStorageKey,
    '[]',
  );

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
        storedDataString={storedDataString}
        setStoredDataString={setStoredDataString}
      />
      <MainContent
        tree={tree}
        handleHatClick={handleHatClick}
        storedDataString={storedDataString}
      />
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
