'use client';

import {
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react';
import { orderedChains } from '@hatsprotocol/constants';
import { useWearerDetails } from 'hats-hooks';
import { useImageURIs, useMediaStyles } from 'hooks';
import _ from 'lodash';
import { usePathname } from 'next/navigation';
import { AppHat, SupportedChains } from 'types';
import { ChakraNextLink } from 'ui';
import { chainsMap } from 'utils';
import { Hex } from 'viem';

import { MobileHatCard, WearerHatCard as CoreHat } from '../cards';

const WearerHats = () => {
  const pathname = usePathname();
  const parsedPathname = pathname.split('/');
  const wearerAddress = _.get(
    parsedPathname,
    _.subtract(_.size(parsedPathname), 1),
  ) as Hex;

  const { data: currentHats } = useWearerDetails({
    wearerAddress,
    chainId: 'all',
  });
  const { isMobile } = useMediaStyles();

  const { data: currentHatsWithImagesData } = useImageURIs({
    hats: currentHats,
  });

  const groupedHats = _.groupBy(currentHatsWithImagesData, 'chainId');
  const localOrderedChains = _.filter(orderedChains, (k: number) =>
    _.includes(_.keys(groupedHats), String(k)),
  );

  if (_.isEmpty(localOrderedChains)) {
    return (
      <Flex w='100%' justify='center' pt='100px'>
        <Stack align='center' gap={10}>
          <Heading size='xl' variant='medium'>
            Not wearing any hats
          </Heading>
          <HStack>
            <ChakraNextLink href='/'>
              <Button variant='outline'>Home</Button>
            </ChakraNextLink>
            <ChakraNextLink href='/trees/new'>
              <Button variant='primary'>Create a new tree</Button>
            </ChakraNextLink>
          </HStack>
        </Stack>
      </Flex>
    );
  }

  return (
    <Stack>
      {_.map(localOrderedChains, (chainId: SupportedChains) => (
        <Stack mt={4} spacing={4} key={chainId}>
          <Heading size='sm'>{chainsMap(Number(chainId)).name}</Heading>

          <SimpleGrid columns={{ base: 1, md: 4 }} gap={5} key={chainId}>
            {_.map(
              _.filter(currentHatsWithImagesData, {
                chainId: Number(chainId),
              }),
              (hat: AppHat) =>
                isMobile ? (
                  <MobileHatCard
                    hat={hat}
                    key={`${chainId}-${hat.id}`}
                    chainId={chainId}
                  />
                ) : (
                  <CoreHat
                    hat={hat}
                    key={`${chainId}-${hat.id}`}
                    chainId={chainId}
                  />
                ),
            )}
          </SimpleGrid>
          <Divider border='1px solid' borderColor='gray.400' />
        </Stack>
      ))}
    </Stack>
  );
};

export default WearerHats;
