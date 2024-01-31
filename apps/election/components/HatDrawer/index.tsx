import { Box, Image } from '@chakra-ui/react';
import _ from 'lodash';

import { useTreeForm } from '../../contexts/EligibilityContext';
import MainContent from './MainContent';

const SelectedHatDrawer = () => {
  const { selectedHat, editMode, treeToDisplay } = useTreeForm();
  const selectedHatId = selectedHat?.id;
  const imageUrl = _.get(
    _.find(treeToDisplay, { id: selectedHatId }),
    'imageUrl',
  );

  if (!selectedHat) return null;

  return (
    <Box
      px={20}
      py={120}
      borderLeft='1px solid'
      borderColor='gray.200'
      display={selectedHatId ? 'block' : 'none'}
      right={0}
      zIndex={12}
      background={editMode ? 'cyan.50' : 'whiteAlpha.900'}
    >
      <Box w='100%' h='100%' position='relative' zIndex={14}>
        {/* Hat Image */}
        <Box
          h='100px'
          w='100px'
          overflow='hidden'
          border='3px solid'
          borderColor='gray.700'
          borderRadius='md'
          top='110px'
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

        <MainContent />
      </Box>
    </Box>
  );
};

export default SelectedHatDrawer;
