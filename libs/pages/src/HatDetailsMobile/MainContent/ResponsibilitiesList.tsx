import { Heading, Stack, Text } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import { DetailsItem } from 'hats-types';
import _ from 'lodash';
import dynamic from 'next/dynamic';

const ResponsibilityItemMobile = dynamic(() =>
  import('ui').then((mod) => mod.ResponsibilityItemMobile),
);

const ResponsibilitiesList = () => {
  const { selectedHatDetails } = useTreeForm();

  const responsibilities = _.get(selectedHatDetails, 'responsibilities');

  if (!responsibilities) return null;

  return (
    <Stack gap={4}>
      <Heading size='sm' variant='medium'>
        {responsibilities.length} Responsibilities expected of Hat Hearers
      </Heading>

      {_.map(responsibilities, (responsibility: DetailsItem) => (
        <ResponsibilityItemMobile
          key={responsibility.label}
          responsibility={responsibility}
        />
      ))}

      {!responsibilities.length && (
        <Text variant='gray' size='sm'>
          None
        </Text>
      )}
    </Stack>
  );
};

export default ResponsibilitiesList;
