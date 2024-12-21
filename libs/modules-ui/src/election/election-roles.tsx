'use client';

import { Heading, Stack, Text } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { get } from 'lodash';
import { useAncillaryElection } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { idToIp } from 'shared';
import { SupportedChains } from 'types';
import { eligibilityRuleToModuleDetails } from 'utils';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

export const ElectionRoles = () => {
  const { selectedHat, activeRule } = useEligibility();
  const moduleDetails = eligibilityRuleToModuleDetails(activeRule);

  const { data: electionsAuthority } = useAncillaryElection({
    chainId: selectedHat?.chainId as SupportedChains,
    id: moduleDetails?.instanceAddress,
  });

  const chainId = selectedHat?.chainId;
  const treeId = selectedHat
    ? hatIdToTreeId(BigInt(selectedHat?.id))
    : undefined;
  const adminHatId = idToIp(get(electionsAuthority, 'adminHat[0].id'));
  const ballotBoxHatId = idToIp(get(electionsAuthority, 'ballotBoxHat.id'));

  return (
    <Stack gap={4}>
      <Heading size='md'>Election Roles</Heading>
      <Stack fontSize='sm'>
        {adminHatId && (
          <Text>
            Set up by Hat{' '}
            <ChakraNextLink
              href={`${CONFIG.APP_URL}/trees/${chainId}/${treeId}${
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
              href={`${CONFIG.APP_URL}/${chainId}/${treeId}${
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
