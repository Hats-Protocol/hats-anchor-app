import { Accordion, Heading, Text } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import { DetailsItem } from 'hats-types';
import _ from 'lodash';
import { ResponsibilitiesListCard } from 'ui';

const ResponsibilitiesList = () => {
  const { selectedHatDetails } = useTreeForm();

  const responsibilities = _.get(selectedHatDetails, 'responsibilities');

  if (!responsibilities) return null;

  return (
    <Accordion allowMultiple>
      <Heading size='sm' fontWeight='medium' textTransform='uppercase' mb={2}>
        Responsibilities
      </Heading>

      {_.map(responsibilities, (responsibility: DetailsItem) => (
        <ResponsibilitiesListCard
          key={responsibility.label}
          responsibility={responsibility}
        />
      ))}

      {!responsibilities.length && (
        <Text color='gray.500' fontSize='sm'>
          None
        </Text>
      )}
    </Accordion>
  );
};

export default ResponsibilitiesList;
