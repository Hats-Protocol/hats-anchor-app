import { Box, Image } from '@chakra-ui/react';
import { HatFormContextProvider, useTreeForm } from 'contexts';
import _ from 'lodash';

import BottomMenu from './BottomMenu';
import EditMode from './EditMode';
import MainContent from './MainContent';
import TopMenu from './TopMenu';

const SelectedHatDrawer = ({ returnToList }: SelectedHatDrawerProps) => {
  const { selectedHat, editMode, treeToDisplay } = useTreeForm();
  const selectedHatId = selectedHat?.id;
  const imageUrl = _.get(
    _.find(treeToDisplay, { id: selectedHatId }),
    'imageUrl',
  );

  if (!selectedHat) return null;

  return (
    <Box
      w='full'
      h='100%'
      borderLeft='1px solid'
      borderColor='gray.200'
      position='fixed'
      display={selectedHatId ? 'block' : 'none'}
      right={0}
      zIndex={12}
      background={editMode ? 'cyan.50' : 'whiteAlpha.900'}
    >
      <Box w='100%' h='100%' position='relative' zIndex={14}>
        {/* Hat Image */}
        <Box
          position='absolute'
          h='100px'
          w='100px'
          overflow='hidden'
          border='3px solid'
          borderColor='gray.700'
          borderRadius='md'
          top='110px'
          left={-81}
          zIndex={16}
        >
          <Image
            loading='lazy'
            src={
              (editMode && imageUrl) ||
              _.get(selectedHat, 'imageUrl') ||
              '/icon.jpeg'
            }
            alt='hat image'
            background='white'
            objectFit='cover'
            h='100%'
          />
        </Box>

        <HatFormContextProvider>
          <TopMenu returnToList={returnToList} />

          {!editMode && <MainContent />}

          {editMode && <EditMode />}

          <BottomMenu />
        </HatFormContextProvider>
      </Box>
    </Box>
  );
};

export default SelectedHatDrawer;

interface SelectedHatDrawerProps {
  returnToList: () => void;
}
