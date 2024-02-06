import { Stack, Tag, Text, VStack } from '@chakra-ui/react';
import _ from 'lodash';
import { useMemo } from 'react';

import { useEligibility } from '../../contexts/EligibilityContext';

const WearersList = () => {
  const { electionsAuthority } = useEligibility();

  const electedAccounts = useMemo(() => {
    const allElectedAccounts = _.flatMap(
      electionsAuthority?.terms,
      'electedAccounts',
    );
    const uniqueElectedAccounts = _.uniq(allElectedAccounts);
    return _.compact(uniqueElectedAccounts);
  }, [electionsAuthority?.terms]);

  return (
    <Stack spacing={4}>
      <Text fontWeight='bold'>Current wearers</Text>
      {electedAccounts && electedAccounts.length > 0 ? (
        <VStack spacing={2} align='start'>
          {electedAccounts.map((account: string, index: number) => (
            // eslint-disable-next-line react/no-array-index-key
            <Tag key={index} size='md' variant='outline' colorScheme='blue'>
              {account}
            </Tag>
          ))}
        </VStack>
      ) : (
        <Text>No elected accounts currently</Text>
      )}
    </Stack>
  );
};

export default WearersList;
