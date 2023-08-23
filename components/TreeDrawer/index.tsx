import { Box } from '@chakra-ui/react';
import _ from 'lodash';

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
      />
      <MainContent
        tree={tree}
        handleHatClick={handleHatClick}
        treeId={treeId}
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
