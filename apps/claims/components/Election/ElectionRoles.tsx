import { Stack, Text } from '@chakra-ui/react';
import { idToIp } from 'shared';
import { ChakraNextLink } from 'ui';

import { useEligibility } from '../../contexts/EligibilityContext';

const APP_URL = 'https://app.hatsprotocol.xyz';

const ElectionRoles = () => {
  const { electionsAuthority } = useEligibility();

  const chainId = 1;
  const treeId = 22;
  const adminHatId = idToIp(electionsAuthority.adminHat[0].id);
  const ballotBoxHatId = idToIp(electionsAuthority.ballotBoxHat.id);

  return (
    <Stack gap={4}>
      <Text fontWeight='bold'>Election Roles</Text>
      <Stack fontSize='sm'>
        {adminHatId && (
          <Text>
            Set up by Hat{' '}
            <ChakraNextLink
              href={`${APP_URL}/${chainId}/${treeId}${
                adminHatId ? `?hatId=${adminHatId}` : ''
              }`}
              decoration
            >
              #{adminHatId}
            </ChakraNextLink>
          </Text>
        )}
        {ballotBoxHatId && (
          <Text>
            Ballot Box set by Hat{' '}
            <ChakraNextLink
              href={`${APP_URL}/${chainId}/${treeId}${
                ballotBoxHatId ? `?hatId=${ballotBoxHatId}` : ''
              }`}
              decoration
            >
              #{ballotBoxHatId}
            </ChakraNextLink>
          </Text>
        )}
      </Stack>
    </Stack>
  );
};

export default ElectionRoles;
