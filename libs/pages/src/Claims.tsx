'use client';

import {
  Card,
  CardBody,
  Heading,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import { get } from 'lodash';
import dynamic from 'next/dynamic';
import { chainsMap, hatLink } from 'utils';

const AgreementClaims = dynamic(() =>
  import('modules-ui').then((mod) => mod.AgreementClaims),
);
const ElectionClaims = dynamic(() =>
  import('modules-ui').then((mod) => mod.ElectionClaims),
);
const SubscriptionClaims = dynamic(() =>
  import('modules-ui').then((mod) => mod.SubscriptionClaims),
);
const SlimModuleDetails = dynamic(() =>
  import('modules-ui').then((mod) => mod.SlimModuleDetails),
);
const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

const Claims = () => {
  const { isClient } = useMediaStyles();
  const {
    chainId,
    selectedHat,
    moduleDetails,
    isHatDetailsLoading,
    isModuleDetailsLoading,
  } = useEligibility();

  if (
    !isClient ||
    isModuleDetailsLoading ||
    isHatDetailsLoading ||
    !selectedHat?.id
  ) {
    return <Skeleton w='full' h='500px' borderRadius='lg' />;
  }

  if (
    chainId === 10 &&
    get(selectedHat, 'id') === CONFIG.agreementV0.communityHatId
  ) {
    return <AgreementClaims />;
  }

  // handle specific modules found
  // TODO migrate to ID and CONSTs
  if (moduleDetails?.name === 'Hats Election Eligibility')
    return <ElectionClaims />;
  if (moduleDetails?.name.includes('Agreement')) return <AgreementClaims />;
  if (moduleDetails?.name.includes('Unlock Protocol'))
    return <SubscriptionClaims />;

  // fallback for other known modules
  if (moduleDetails) return <SlimModuleDetails type='eligibility' />;

  // fallback for unknown modules
  return (
    <Card>
      <CardBody>
        <Stack>
          <Heading size='xl'>No compatible module found</Heading>
          <Text>
            No compatible module found for hat{' '}
            <ChakraNextLink
              href={hatLink({ chainId, hatId: selectedHat?.id })}
              decoration
            >
              #{hatIdDecimalToIp(BigInt(selectedHat?.id))}
            </ChakraNextLink>{' '}
            on {chainsMap(chainId)?.name}
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default Claims;
