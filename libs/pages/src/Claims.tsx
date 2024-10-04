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
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import { get } from 'lodash';
import dynamic from 'next/dynamic';
import { chainsMap } from 'utils';

import {
  Agreement,
  AgreementV0,
  Election,
  KnownModule,
  Subscription,
} from './modules';

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
    return (
      <Skeleton w='full' h='500px' borderRadius='lg' ml={{ md: 8, lg: 10 }} />
    );
  }

  if (
    chainId === 10 &&
    get(selectedHat, 'id') === CONFIG.agreementV0.communityHatId
  ) {
    return <AgreementV0 />;
  }

  // handle specific modules found
  // TODO migrate to ID and CONSTs
  if (moduleDetails?.name === 'Hats Election Eligibility') return <Election />;
  if (moduleDetails?.name.includes('Agreement')) return <Agreement />;
  if (moduleDetails?.name.includes('Unlock Protocol')) return <Subscription />;

  // fallback for other known modules
  if (moduleDetails) return <KnownModule />;

  // fallback for unknown modules
  return (
    <Card>
      <CardBody>
        <Stack>
          <Heading size='xl'>No compatible module found</Heading>
          <Text>
            No compatible module found for hat{' '}
            <ChakraNextLink
              href={`${CONFIG.APP_URL}/trees/${chainId}/${hatIdToTreeId(
                BigInt(selectedHat?.id),
              )}?hatId=${hatIdDecimalToIp(BigInt(selectedHat?.id))}`}
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
