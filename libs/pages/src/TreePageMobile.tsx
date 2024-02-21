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
} from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
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
    editMode,
    topHat,
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

      <Layout editMode={editMode} hatData={topHat}>
        <Box w='full' h='100%' position='fixed' pt={16} overflowY='scroll'>
          {exists ? (
            _.isEmpty(sortedTree) ? (
              <Flex justify='center' align='center' w='full' h='full'>
                <Spinner />
              </Flex>
            ) : (
              <Stack>
                <Box w='full' px={2} position='relative'>
                  {sortedTree.length > 0 && (
                    <MobileHatCard hat={sortedTree[0]} key={sortedTree[0].id} />
                  )}
                </Box>
                {sortedTree.length > 1 && (
                  <Stack w='full' px={2} position='relative' pb={4}>
                    <VerticalDividers count={maxDepth + 2} />

                    {_.map(sortedTree.slice(1), (hat) => (
                      <MobileHatCard hat={hat} key={hat.id} />
                    ))}
                  </Stack>
                )}
              </Stack>
            )
          ) : (
            <Flex justify='center' align='center' w='full' h='full' pt={20}>
              <Stack spacing={8} align='center'>
                <Heading size='md'>Tree not found!</Heading>
                <Image src='/no-hats.jpg' alt='No hats found' h='600px' />
                <Flex>
                  <ChakraNextLink href='/'>
                    <Button
                      variant='outline'
                      rightIcon={<Icon as={BsArrowRight} />}
                    >
                      🧢 Head home
                    </Button>
                  </ChakraNextLink>
                </Flex>
              </Stack>
            </Flex>
          )}
        </Box>
      </Layout>
    </>
  );
};

export default TreePageMobile;
