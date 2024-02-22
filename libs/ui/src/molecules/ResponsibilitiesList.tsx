import { Accordion, Heading, Stack, Text } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import { DetailsItem } from 'hats-types';
import _ from 'lodash';

import ResponsibilitiesListCard from './ResponsibilitiesListCard';

const ResponsibilitiesList = () => {
  const { selectedHatDetails } = useTreeForm();

  const responsibilities = _.get(selectedHatDetails, 'responsibilities');

  if (!responsibilities) return null;

  return (
    <Accordion px={{ base: 4, md: 10 }} allowMultiple>
      <Heading size='sm' variant='bold'>
        {responsibilities.length} Responsibilities expected of Hat Hearers
      </Heading>

      <Stack spacing={0}>
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
    </Accordion>
  );
};

export default ResponsibilitiesList;
