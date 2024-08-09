'use client';

import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { CONFIG, ORDERED_CHAINS } from '@hatsprotocol/constants';
import { useWearerDetails } from 'hats-hooks';
import { useMediaStyles } from 'hooks';
import { compact, filter, indexOf, isEmpty, map, size, sortBy } from 'lodash';
import { ReactNode } from 'react';
import { BsDiagram3 } from 'react-icons/bs';
import { FaArrowRight } from 'react-icons/fa';
import { AppHat } from 'types';
import { ChakraNextLink } from 'ui';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useEnsName } from 'wagmi';

import { DashboardHatCard } from './cards';

const HATS_TO_SHOW = 6;
const MOBILE_HATS_TO_SHOW = 3;

const MyHatsCard = ({
  name,
  hasHats,
  children,
}: {
  name: string | undefined;
  hasHats?: boolean;
  children: ReactNode;
}) => {
  const { isMobile } = useMediaStyles();

  return (
    <>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justifyContent='space-between'
        gap={10}
      >
        <Stack>
          <Skeleton isLoaded={!!name} minH='45px' minW='300px'>
            <Heading variant='medium'>gm {name} 👋</Heading>
          </Skeleton>

          {hasHats && (
            <Text size='lg'>
              Here&apos;s what&apos;s happening with your hats
            </Text>
          )}
        </Stack>

        {!isMobile && (
          <Box>
            <ChakraNextLink href='/trees/new'>
              <Button colorScheme='blue' py={6} px={8}>
                <HStack gap={3}>
                  <BsDiagram3 />
                  <Text size='lg' variant='medium' noOfLines={1}>
                    Create a new {CONFIG.tree}
                  </Text>
                </HStack>
              </Button>
            </ChakraNextLink>
          </Box>
        )}
      </Flex>

      {children}
    </>
  );
};

const MyHats = () => {
  const { address: currentUser } = useAccount();
  const { isMobile } = useMediaStyles();

  const { data: currentHats, isLoading: wearerDetailsLoading } =
    useWearerDetails({
      wearerAddress: currentUser as Hex,
      chainId: 'all',
    });

  const sortedHats = sortBy(compact(currentHats), (hat: AppHat) => {
    return indexOf(ORDERED_CHAINS, hat?.chainId);
  });
  const activeHats = filter(sortedHats, ['status', true]);

  const overrideEmptyCurrentHats = isEmpty(activeHats)
    ? Array(isMobile ? 4 : 8).fill({ id: '123' })
    : activeHats.splice(0, isMobile ? MOBILE_HATS_TO_SHOW : HATS_TO_SHOW);

  const { data: ensName } = useEnsName({ address: currentUser, chainId: 1 });

  if (!currentUser) {
    return (
      <Stack>
        <Heading variant='medium'>
          Welcome to Hats Protocol!{' '}
          <span role='img' aria-label='Hats ball cap'>
            🧢
          </span>
        </Heading>
        <Text size='lg'>Please connect your wallet to get started.</Text>
      </Stack>
    );
  }

  if (isEmpty(activeHats) || wearerDetailsLoading) {
    return (
      <MyHatsCard name={ensName || formatAddress(currentUser)}>
        <Card py={8} px={9} background='whiteAlpha.600' gap={4}>
          <Skeleton height='40px' />
          <SimpleGrid
            columns={{
              base: 1,
              sm: 2,
              md: 3,
            }}
            spacing={6}
          >
            {Array(isMobile ? MOBILE_HATS_TO_SHOW : HATS_TO_SHOW)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} borderRadius='md' height='100px' />
              ))}
          </SimpleGrid>
        </Card>
      </MyHatsCard>
    );
  }

  if (!isEmpty(sortedHats)) {
    return (
      <MyHatsCard name={ensName || formatAddress(currentUser)}>
        <Card py={8} px={9} background='whiteAlpha.600' gap={4}>
          <Flex justifyContent='space-between' alignItems='center'>
            <Heading>Your hats</Heading>
            {size(sortedHats) >
              (isMobile ? MOBILE_HATS_TO_SHOW : HATS_TO_SHOW) && (
              <ChakraNextLink
                as={ChakraNextLink}
                href={`/wearers/${currentUser}`}
              >
                <HStack alignItems='center'>
                  <Text>View {!isMobile ? 'all of ' : ''}your hats</Text>
                  <FaArrowRight />
                </HStack>
              </ChakraNextLink>
            )}
          </Flex>
          <SimpleGrid
            columns={{
              base: 1,
              sm: 2,
              md: 3,
            }}
            spacing={6}
          >
            {map(overrideEmptyCurrentHats, (hat: AppHat, i: number) => (
              <Skeleton
                isLoaded={!!hat.id && !wearerDetailsLoading}
                borderRadius='md'
                key={i}
              >
                <DashboardHatCard hat={hat} />
              </Skeleton>
            ))}
          </SimpleGrid>
        </Card>
      </MyHatsCard>
    );
  }

  return (
    <MyHatsCard name={ensName || formatAddress(currentUser)}>
      <Card
        py={8}
        px={9}
        background='whiteAlpha.600'
        gap={4}
        justifyContent='center'
        alignItems='center'
      >
        <Stack align='center'>
          <Heading size='lg'>Your hats will appear here!</Heading>
          <Text>Create a tree or check out one of the featured trees.</Text>
        </Stack>
      </Card>
    </MyHatsCard>
  );
};

export default MyHats;
