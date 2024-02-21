import { Accordion, Heading, Stack, Text } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import { DetailsItem } from 'hats-types';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';

import ResponsibilitiesListCardMobile from './Mobile/ResponsibilitiesListCard';
import ResponsibilitiesListCard from './ResponsibilitiesListCard';

const ResponsibilitiesList = () => {
  const { selectedHatDetails } = useTreeForm();
  const { isMobile } = useMediaStyles();

  const responsibilities = _.get(selectedHatDetails, 'responsibilities');

  if (!responsibilities) return null;

  return (
    <Accordion allowMultiple>
      {isMobile ? (
        <Heading size='sm' variant='medium'>
          {responsibilities.length} Responsibilities expected of Hat Hearers
        </Heading>
      ) : (
        <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
          Responsibilities
        </Heading>
      )}

      <Stack mt={4} gap={4}>
        {_.map(responsibilities, (responsibility: DetailsItem) =>
          isMobile ? (
            <ResponsibilitiesListCardMobile
              key={responsibility.label}
              responsibility={responsibility}
            />
          ) : (
            <ResponsibilitiesListCard
              key={responsibility.label}
              responsibility={responsibility}
            />
          ),
        )}
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
