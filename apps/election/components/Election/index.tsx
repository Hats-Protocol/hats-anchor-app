import { Box, Image, Stack } from '@chakra-ui/react';
import { MODULE_TYPES } from 'app-constants';
import _ from 'lodash';

import { useEligibility } from '../../contexts/EligibilityContext';
import ModuleDetails from '../ModuleDetails';
import DetailList from './DetailList';
import Header from './Header';
import WearersList from './WearersList';

const SelectedHatDrawer = () => {
  const { selectedHat, selectedHatDetails } = useEligibility();

  const { toggle, eligibility } = _.pick(selectedHatDetails, [
    'toggle',
    'eligibility',
  ]);

  const selectedHatId = selectedHat?.id;

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
      background='whiteAlpha.900'
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
            src={_.get(selectedHat, 'imageUrl') || '/icon.jpeg'}
            alt='hat image'
            background='white'
            objectFit='cover'
            h='100%'
          />
        </Box>

        <Stack
          p={10}
          spacing={10}
          w='100%'
          overflow='scroll'
          height='calc(100% - 150px)'
          pb={400}
          pos='relative'
          color='blackAlpha.800'
        >
          <Header />
          <WearersList />

          <Stack spacing={4}>
            <ModuleDetails type={MODULE_TYPES.eligibility} />
            {!_.isEmpty(eligibility?.criteria) && (
              <DetailList
                title='Eligibility Criteria'
                details={eligibility?.criteria}
                inline
              />
            )}
          </Stack>

          {/* MODULE DETAILS */}
          {!_.isEmpty(toggle?.criteria) && (
            <DetailList
              title='Toggle Criteria'
              details={toggle?.criteria}
              inline
            />
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default SelectedHatDrawer;
