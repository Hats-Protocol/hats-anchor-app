/* eslint-disable no-nested-ternary */
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Spinner,
  Stack,
  VStack,
} from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { HatWithDepth } from 'hats-types';
import { isTopHat, prepareMobileTreeHats } from 'hats-utils';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import { BsArrowRight } from 'react-icons/bs';
import { chainsMap } from 'utils';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);
const Layout = dynamic(() => import('ui').then((mod) => mod.Layout));
const MobileHatCard = dynamic(() =>
  import('ui').then((mod) => mod.MobileHatCard),
);
const VerticalDividers = dynamic(() =>
  import('ui').then((mod) => mod.VerticalDividers),
);

const TreePageMobile = ({ exists = true }: { exists: boolean }) => {
  const {
    chainId,
    treeId,
    selectedHat,
    selectedHatDetails,
    treeToDisplay,
    topHatDetails,
  } = useTreeForm();

  const sortedTree = prepareMobileTreeHats(treeToDisplay);
  if (!chainId) return null;
  const chain = chainsMap(chainId);

  let title = '';
  if (_.isFinite(_.toNumber(treeId))) {
    title = `Tree #${hatIdToTreeId(BigInt(treeId))} on ${chain.name}`;
  } else {
    title = 'Invalid Tree ID';
  }
  if (!selectedHat && topHatDetails) {
    title = `${topHatDetails.name} on ${chain.name}`;
  } else if (selectedHat) {
    if (selectedHatDetails) {
      title = `${selectedHatDetails.name} on ${chain.name}`;
    } else {
      title = `${isTopHat(selectedHat) ? 'Top ' : ''}Hat #${hatIdDecimalToIp(
        BigInt(_.get(selectedHat, 'id')),
      )} on ${chain.name}`;
    }
  }
  const maxDepth = _.maxBy(sortedTree, 'depth')?.depth || 0;

  return (
    <>
      <NextSeo title={title} />
      <Layout>
        <Flex direction='column' w='full' h='full' pt={16}>
          {exists ? (
            _.isEmpty(sortedTree) ? (
              <Flex justify='center' align='center' w='full' flexGrow={1}>
                <Spinner />
              </Flex>
            ) : (
              <>
                <Box px={2} zIndex='sticky' mb={2}>
                  {sortedTree.length > 0 && (
                    <MobileHatCard hat={sortedTree[0]} key={sortedTree[0].id} />
                  )}
                </Box>

                <Flex
                  direction='column'
                  overflowY='auto'
                  flexGrow={1}
                  bg='white'
                >
                  <VStack
                    w='full'
                    px={2}
                    position='relative'
                    py={2}
                    spacing={2}
                  >
                    <VerticalDividers count={maxDepth + 2} />

                    {_.map(sortedTree.slice(1), (hat: HatWithDepth) => (
                      <MobileHatCard hat={hat} key={hat.id} />
                    ))}
                  </VStack>
                </Flex>
              </>
            )
          ) : (
            <Flex justify='center' align='center' w='full' flexGrow={1}>
              <Stack spacing={8} align='center'>
                <Heading size='md'>Tree not found!</Heading>
                <Image src='/no-hats.jpg' alt='No hats found' h='600px' />
                <ChakraNextLink href='/'>
                  <Button
                    variant='outline'
                    rightIcon={<Icon as={BsArrowRight} />}
                  >
                    🧢 Head home
                  </Button>
                </ChakraNextLink>
              </Stack>
            </Flex>
          )}
        </Flex>
      </Layout>
    </>
  );
};

export default TreePageMobile;
