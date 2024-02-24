import { Accordion, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import { DetailsItem } from 'hats-types';
import _ from 'lodash';

import ResponsibilitiesListCard from './ResponsibilitiesListCard';

const ResponsibilitiesList = () => {
  const { selectedHatDetails } = useTreeForm();

  const responsibilities = _.get(selectedHatDetails, 'responsibilities');

  if (!responsibilities) return null;

  if (_.isEmpty(responsibilities)) {
    return (
      <Flex px={{ base: 0, md: 10 }} py={4}>
        <Heading
          size={{ base: 'sm', md: 'md' }}
          mx={{ base: 4, md: 0 }}
          variant='medium'
        >
          No Responsibilities found for Wearers currently
        </Heading>
      </Flex>
    );
  }

  return (
    <Accordion px={{ base: 0, md: 10 }} allowMultiple>
      <Stack>
        <Heading
          size={{ base: 'sm', md: 'md' }}
          mx={{ base: 4, md: 0 }}
          variant='medium'
        >
          {_.size(responsibilities)}{' '}
          {_.size(responsibilities) > 1 ? 'Responsibilities' : 'Responsibility'}{' '}
          expected of Hat Wearers
        </Heading>

        <Stack spacing={1}>
          {_.map(responsibilities, (responsibility: DetailsItem) => (
            <ResponsibilitiesListCard
              key={responsibility.label}
              responsibility={responsibility}
            />
          ))}
        </Stack>

        {!responsibilities.length && (
          <Text variant='gray' size='sm'>
            None
          </Text>
        )}
      </Stack>
    </Accordion>
  );
};

export default ResponsibilitiesList;
