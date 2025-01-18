'use client';

import { Box, Button, Flex, Heading, Icon, Image, Skeleton, Stack, Text, VStack } from '@chakra-ui/react';
import { DEFAULT_HAT } from '@hatsprotocol/constants';
import { useTreeForm } from 'contexts';
import { prepareMobileTreeHats } from 'hats-utils';
import { useMediaStyles } from 'hooks';
import { first, get, isBoolean, map, maxBy, size } from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { BsArrowRight } from 'react-icons/bs';
import { HatWithDepth } from 'types';

const Link = dynamic(() => import('ui').then((mod) => mod.Link));
const MobileHatCard = dynamic(() => import('molecules').then((mod) => mod.MobileHatCard));
const VerticalDividers = dynamic(() => import('molecules').then((mod) => mod.VerticalDividers));
const HatDeco = dynamic(() => import('ui').then((mod) => mod.HatDeco));

const DEFAULT_LOADING_CARDS = 8;

// TODO fix exists lookup
const TreePageMobile = ({ exists = true }: { exists: boolean }) => {
  const { chainId, treeId, treeToDisplay, isLoading: treeIsLoading } = useTreeForm();
  const router = useRouter();
  const params = useSearchParams();
  const { isMobile } = useMediaStyles();
  const hatParam = params.get('hatId');
  if (hatParam && typeof window !== 'undefined' && isBoolean(isMobile) && isMobile) {
    router.push(`/trees/${chainId}/${treeId}/${hatParam}`);
  }

  const sortedTree = treeIsLoading
    ? map(
        Array(DEFAULT_LOADING_CARDS).fill(DEFAULT_HAT),
        // HatWithDepth
        (h: any, i: number) => ({ ...h, id: i }),
      )
    : prepareMobileTreeHats(treeToDisplay);
  if (!chainId) return null;

  const maxDepth = maxBy(sortedTree, 'depth')?.depth || 0;

  if (!exists) {
    return (
      <Flex justify='center' align='center' w='full' flexGrow={1} bg='white'>
        <Stack spacing={8} align='center'>
          <Heading size='md'>Tree not found!</Heading>
          <Image src='/tree-not-found.svg' alt='No hats found' h='600px' />
          <Link href='/' passHref>
            <Button variant='outline' rightIcon={<Icon as={BsArrowRight} />}>
              <span aria-label='Ball cap' role='img'>
                🧢
              </span>{' '}
              Head home
            </Button>
          </Link>
        </Stack>
      </Flex>
    );
  }

  if (!treeIsLoading && size(sortedTree) === 1) {
    return (
      <Flex direction='column' w='full' h='full' pt={16}>
        <Box px={2} zIndex='sticky' pb={2} boxShadow='0px 2px 4px 0px rgba(0,0,0,0.75);'>
          <Skeleton isLoaded={get(first(sortedTree), 'id')} minH='72px' borderRadius='md'>
            <MobileHatCard hat={first(sortedTree)} maxDepth={maxDepth} />
          </Skeleton>
        </Box>

        <Flex boxSize='100%' justify='center' align='center' bg='white'>
          <Stack align='center' spacing={6} maxW='60%'>
            <Heading size='lg'>
              No hats found
              <span aria-label='Top hat' role='img'>
                🎩
              </span>
            </Heading>
            <Text textAlign='center'>Get started creating hats for your tree on a desktop.</Text>
          </Stack>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction='column' w='full' h='full' pt={16}>
      <Box p={2} zIndex={5} mt={-2} position='fixed' w='100%' boxShadow='0px 2px 4px 0px rgba(0,0,0,0.75);' bg='white'>
        <Skeleton isLoaded={get(first(sortedTree), 'id')} minH='72px' borderRadius={6}>
          <MobileHatCard hat={first(sortedTree)} maxDepth={maxDepth} key={get(first(sortedTree), 'id')} />
        </Skeleton>
      </Box>

      <Flex direction='column' overflowY='auto' flexGrow={1} bg='white' position='relative'>
        {(size(sortedTree) > 1 || !sortedTree) && <VerticalDividers count={maxDepth + 2} />}
        <VStack w='full' maxW='100%' h='100%' px={2} py={2} mt='80px' spacing={2}>
          {map(sortedTree.slice(1), (hat: HatWithDepth) => (
            <Skeleton
              display='flex'
              justifyContent='end'
              borderRadius={6}
              w='100%'
              minH='72px'
              isLoaded={!!sortedTree && !!hat.id}
              key={hat.id}
            >
              <MobileHatCard hat={hat} maxDepth={maxDepth} />
            </Skeleton>
          ))}

          <HatDeco />
        </VStack>
      </Flex>
    </Flex>
  );
};

export default TreePageMobile;
