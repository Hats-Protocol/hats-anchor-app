import { Heading, Stack, Text } from '@chakra-ui/react';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import _ from 'lodash';
import { idToIp } from 'shared';

import { ChakraNextLink } from '../atoms';

const APP_URL = 'https://app.hatsprotocol.xyz';

const ElectionRoles = () => {
  const { electionsAuthority, selectedHat } = useEligibility();

  const chainId = selectedHat?.chainId;
  const treeId = selectedHat
    ? hatIdToTreeId(BigInt(selectedHat?.id))
    : undefined;
  const adminHatId = idToIp(_.get(electionsAuthority, 'adminHat[0].id'));
  const ballotBoxHatId = idToIp(_.get(electionsAuthority, 'ballotBoxHat.id'));

  return (
    <Stack gap={4}>
      <Heading size='md'>Election Roles</Heading>
      <Stack fontSize='sm'>
        {adminHatId && (
          <Text>
            Set up by Hat{' '}
            <ChakraNextLink
              href={`${APP_URL}/trees/${chainId}/${treeId}${
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
            Results submitted by{' '}
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
