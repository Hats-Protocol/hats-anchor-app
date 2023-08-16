import { Box } from '@chakra-ui/react';
import _ from 'lodash';

import TopMenu from './TopMenu';
import MainContent from './MainContent';
import { IHat } from '@/types';

const TreeDrawer = ({
  editMode,
  setEditMode,
  onClose,
  tree,
  handleHatClick,
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
      />
      <MainContent tree={tree} handleHatClick={handleHatClick} />
    </Box>
  );
};

export default TreeDrawer;

interface TreeDrawerProps {
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  onClose: () => void;
  tree: IHat[];
  handleHatClick: (hatId: string) => void;
}
