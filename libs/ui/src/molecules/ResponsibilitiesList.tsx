import { Accordion, Heading, Skeleton, Stack } from '@chakra-ui/react';
import { useSelectedHat } from 'contexts';
import _ from 'lodash';
import { DetailsItem } from 'types';

import ResponsibilitiesListCard from './ResponsibilitiesListCard';

const LOADING_RESPONSIBILITIES: DetailsItem[] = Array(3).fill({
  label: 'Loading...',
  description: 'Loading...',
});

// TODO need to handle case for automated integrations when using plaintext details

const ResponsibilitiesList = () => {
  const { selectedHatDetails, hatLoading } = useSelectedHat();
  const responsibilities = _.get(selectedHatDetails, 'responsibilities');
  const localResponsibilities = responsibilities || LOADING_RESPONSIBILITIES;

  if ((!hatLoading && _.isEmpty(responsibilities)) || !selectedHatDetails) {
    return null;
    // return (
    //   <Flex px={{ base: 0, md: 10 }} py={4}>
    //     <Heading
    //       size={{ base: 'sm', md: 'md' }}
    //       mx={{ base: 4, md: 0 }}
    //       variant='medium'
    //     >
    //       No Responsibilities expected of Wearers
    //     </Heading>
    //   </Flex>
    // );
  }

  return (
    <Accordion px={{ base: 0, md: 10 }} allowMultiple>
      <Stack>
        <Skeleton isLoaded={!hatLoading && !!responsibilities}>
          <Heading
            size={{ base: 'sm', md: 'md' }}
            mx={{ base: 4, md: 0 }}
            variant={{ base: 'medium', md: 'default' }}
          >
            {_.size(responsibilities)}{' '}
            {_.size(responsibilities) > 1
              ? 'Responsibilities'
              : 'Responsibility'}{' '}
            expected of Hat Wearers
          </Heading>
        </Skeleton>

        <Stack spacing={1}>
          {_.map(
            localResponsibilities,
            (responsibility: DetailsItem, index: number) => (
              <ResponsibilitiesListCard
                key={`${responsibility.label}-${index}`}
                responsibility={responsibility}
              />
            ),
          )}
        </Stack>
      </Stack>
    </Accordion>
  );
};

export default ResponsibilitiesList;
