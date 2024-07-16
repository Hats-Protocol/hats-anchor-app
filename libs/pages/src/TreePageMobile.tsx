'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Skeleton,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { DEFAULT_HAT } from '@hatsprotocol/constants';
import { useTreeForm } from 'contexts';
import { prepareMobileTreeHats } from 'hats-utils';
import { first, get, map, maxBy, size } from 'lodash';
import dynamic from 'next/dynamic';
import { BsArrowRight } from 'react-icons/bs';
import { HatWithDepth } from 'types';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);
const MobileHatCard = dynamic(() =>
  import('molecules').then((mod) => mod.MobileHatCard),
);
const VerticalDividers = dynamic(() =>
  import('molecules').then((mod) => mod.VerticalDividers),
);

const DEFAULT_LOADING_CARDS = 8;

// TODO fix exists lookup
const TreePageMobile = ({ exists = true }: { exists: boolean }) => {
  const {
    chainId,
    // treeId,
    treeToDisplay,
    isLoading: treeIsLoading,
  } = useTreeForm();
  // const params = useSearchParams();
  // const hatParam = params.get('hatId');
  // if (hatParam && typeof window !== 'undefined') {
  //   window.history.pushState({}, '', `/trees/${chainId}/${treeId}/${hatParam}`);
  // }

  const sortedTree = treeIsLoading
    ? Array(DEFAULT_LOADING_CARDS).fill(DEFAULT_HAT)
    : prepareMobileTreeHats(treeToDisplay);
  if (!chainId) return null;
  // const chain = chainsMap(chainId);

  // let title = '';
  // if (_.isFinite(_.toNumber(treeId))) {
  //   title = treeId
  //     ? `Tree #${hatIdToTreeId(BigInt(treeId))} on ${chain.name}`
  //     : '';
  // } else {
  //   title = 'Invalid Tree ID';
  // }
  // if (!selectedHat && topHatDetails) {
  //   title = `${topHatDetails.name} on ${chain.name}`;
  // } else if (selectedHat) {
  //   if (selectedHatDetails) {
  //     title = `${selectedHatDetails.name} on ${chain.name}`;
  //   } else {
  //     title = `${isTopHat(selectedHat) ? 'Top ' : ''}Hat #${hatIdDecimalToIp(
  //       BigInt(_.get(selectedHat, 'id')),
  //     )} on ${chain.name}`;
  //   }
  // }
  const maxDepth = maxBy(sortedTree, 'depth')?.depth || 0;
  // console.log(maxDepth);

  if (!exists) {
    return (
      <Flex justify='center' align='center' w='full' flexGrow={1} bg='white'>
        <Stack spacing={8} align='center'>
          <Heading size='md'>Tree not found!</Heading>
          <Image src='/no-hats.jpg' alt='No hats found' h='600px' />
          <ChakraNextLink href='/'>
            <Button variant='outline' rightIcon={<Icon as={BsArrowRight} />}>
              <span aria-label='Ball cap' role='img'>
                🧢
              </span>{' '}
              Head home
            </Button>
          </ChakraNextLink>
        </Stack>
      </Flex>
    );
  }

  if (!treeIsLoading && size(sortedTree) === 1) {
    return (
      <Flex direction='column' w='full' h='full' pt={16}>
        <Box
          px={2}
          zIndex='sticky'
          pb={2}
          boxShadow='0px 2px 4px 0px rgba(0,0,0,0.75);'
        >
          <Skeleton isLoaded={get(first(sortedTree), 'id')} minH='72px'>
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
            <Text textAlign='center'>
              Get started creating hats for your tree on a desktop.
            </Text>
          </Stack>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction='column' w='full' h='full' pt={16}>
      <Box
        p={2}
        zIndex={5}
        mt={-2}
        position='fixed'
        w='100%'
        boxShadow='0px 2px 4px 0px rgba(0,0,0,0.75);'
        bg='white'
      >
        <Skeleton
          isLoaded={get(first(sortedTree), 'id')}
          minH='72px'
          borderRadius={6}
        >
          <MobileHatCard
            hat={first(sortedTree)}
            maxDepth={maxDepth}
            key={get(first(sortedTree), 'id')}
          />
        </Skeleton>
      </Box>

      <Flex
        direction='column'
        overflowY='auto'
        flexGrow={1}
        bg='white'
        position='relative'
      >
        {(size(sortedTree) > 1 || !sortedTree) && (
          <VerticalDividers count={maxDepth + 2} />
        )}
        <VStack
          w='full'
          maxW='100%'
          h='100%'
          px={2}
          py={2}
          mt='80px'
          spacing={2}
        >
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
          <Flex minH='150px' justify='center' align='center'>
            <Text size='sm'>
              <span aria-label='Ball cap' role='img'>
                🧢
              </span>
              <span aria-label='Top hat' role='img'>
                🎩
              </span>
              <span aria-label='Hat with bow' role='img'>
                👒
              </span>
            </Text>
            {/* <Button variant='outlineMatch' size='sm' colorScheme='blue.500'>
                  Return to top
                </Button> */}
          </Flex>
        </VStack>
      </Flex>
    </Flex>
  );
};

export default TreePageMobile;
