import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  useMediaQuery,
} from '@chakra-ui/react';
import {
  CONFIG,
  LEARN_MORE,
  orderedChains,
  TemplateData,
} from '@hatsprotocol/constants';
import {
  useFeaturedTemplates,
  useFeaturedTrees,
  useFeaturedTreesData,
  useImageURIs,
} from 'app-hooks';
import { formatAddress } from 'app-utils';
import { useWearerDetails } from 'hats-hooks';
import { AppHat } from 'hats-types';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsDiagram3 } from 'react-icons/bs';
import { FaArrowRight } from 'react-icons/fa';
import { ChakraNextLink, Suspender } from 'ui';
import { useAccount, useEnsName } from 'wagmi';

import ForkableTemplateCard from '../components/ForkableTemplateCard';
import Layout from '../components/Layout';
import LearnMoreCard, { DocsLink } from '../components/LearnMoreCard';

const DashboardHatCard = dynamic(
  () => import('../components/DashboardHatCard'),
  {
    loading: () => <Suspender />,
  },
);
const FeaturedTreeCard = dynamic(
  () => import('../components/FeaturedTreeCard'),
  {
    loading: () => <Suspender />,
  },
);

const Home = () => {
  const { address: wearerAddress } = useAccount();
  const { data: featuredTemplates } = useFeaturedTemplates();
  const { data: featuredTrees } = useFeaturedTrees();
  const { data: hatsAndWearers } = useFeaturedTreesData(featuredTrees);

  const [isSmallerScreen] = useMediaQuery('(max-width: 1700px)');

  const { data: currentHats } = useWearerDetails({
    wearerAddress,
    chainId: 'all',
  });

  const sortedHats = _.sortBy(_.compact(currentHats), (hat: AppHat) => {
    return _.indexOf(orderedChains, hat?.chainId);
  });
  const activeHats = _.filter(sortedHats, ['status', true]);

  const { data: currentHatsWithImagesData } = useImageURIs({
    hats: activeHats ? activeHats.splice(0, 8) : [],
  });

  const { data: ensName } = useEnsName({ address: wearerAddress, chainId: 1 });

  return (
    <Layout>
      <Box
        w='100%'
        h='100%'
        bg='blue'
        position='fixed'
        opacity={0.07}
        zIndex={-1}
      />
      <Stack spacing={10} px={20} py={120}>
        {wearerAddress ? (
          <Flex justifyContent='space-between'>
            <Stack>
              <Text fontSize={24} fontWeight='medium'>
                gm {ensName || formatAddress(wearerAddress)} 👋
              </Text>
              {!_.isEmpty(sortedHats) && (
                <Text fontSize={18}>
                  Here&apos;s what&apos;s happening with your hats
                </Text>
              )}
            </Stack>

            <Box>
              <ChakraNextLink href='/trees/new'>
                <Button colorScheme='blue' py={6} px={8}>
                  <BsDiagram3 />
                  <Text fontSize={18} fontWeight='medium' noOfLines={1} ml={3}>
                    Create a new {CONFIG.tree}
                  </Text>
                </Button>
              </ChakraNextLink>
            </Box>
          </Flex>
        ) : (
          <Stack>
            <Text fontSize={24} fontWeight='medium'>
              Welcome to Hats Protocol! 🧢
            </Text>
            <Text fontSize={18}>
              Please connect your wallet to get started.
            </Text>
          </Stack>
        )}

        {wearerAddress &&
          currentHatsWithImagesData &&
          (!_.isEmpty(sortedHats) ? (
            <Card py={8} px={9} background='whiteAlpha.600' gap={4}>
              <Flex justifyContent='space-between' alignItems='center'>
                <Text fontSize={24} fontWeight='medium'>
                  Your hats
                </Text>
                {sortedHats.length > 8 && (
                  <ChakraNextLink
                    as={ChakraNextLink}
                    href={`/wearers/${wearerAddress}`}
                  >
                    <HStack alignItems='center'>
                      <Text>View all of your hats</Text> <FaArrowRight />
                    </HStack>
                  </ChakraNextLink>
                )}
              </Flex>
              <SimpleGrid
                columns={{
                  base: 1,
                  sm: 2,
                  md: 3,
                  lg: 4,
                }}
                spacing={6}
              >
                {_.map(currentHatsWithImagesData, (hat: AppHat, i: number) => (
                  <DashboardHatCard hat={hat} key={i} />
                ))}
              </SimpleGrid>
            </Card>
          ) : (
            <Card py={8} px={9} background='whiteAlpha.600' gap={4}>
              <Flex minH={20} justify='center' align='center'>
                <Stack align='center'>
                  <Heading size='md'>Your hats will appear here</Heading>
                  <Text>
                    Create a tree or check out the starter templates below.
                  </Text>
                </Stack>
              </Flex>
            </Card>
          ))}

        <Flex
          alignItems='start'
          gap={10}
          direction={isSmallerScreen ? 'column' : 'row'}
        >
          <Stack spacing={10} flex={1}>
            <Card py={8} px={9} background='whiteAlpha.600' gap={4}>
              <Text fontSize={24} fontWeight='medium'>
                Explore featured trees
              </Text>
              <SimpleGrid columns={3} spacing={6}>
                {_.map(featuredTrees, (tree: TemplateData, i: number) => (
                  <FeaturedTreeCard
                    key={i}
                    treeData={tree}
                    hatsAndWearers={_.find(
                      hatsAndWearers,
                      (h: { treeId: string }) => Number(h.treeId) === tree.id,
                    )}
                  />
                ))}
              </SimpleGrid>
            </Card>

            <Card py={8} px={9} background='whiteAlpha.600' gap={4}>
              <Text fontSize={24} fontWeight='medium'>
                Jump right in with a forkable template
              </Text>
              <SimpleGrid columns={3} spacing={6}>
                {_.map(featuredTemplates, (tree: TemplateData, i: number) => (
                  <ForkableTemplateCard key={i} treeData={tree} />
                ))}
              </SimpleGrid>
            </Card>
          </Stack>

          <Card
            py={8}
            px={9}
            background='whiteAlpha.600'
            gap={4}
            maxW={isSmallerScreen ? '100%' : '427px'}
          >
            <Text fontSize={24} fontWeight='medium'>
              Learn more about Hats
            </Text>
            {isSmallerScreen ? (
              <Grid templateColumns='repeat(2, 1fr)' gap={6}>
                {_.map(LEARN_MORE, (docsLink: DocsLink, i: number) => (
                  <LearnMoreCard key={i} docsData={docsLink} />
                ))}
              </Grid>
            ) : (
              <Stack spacing={6}>
                {_.map(LEARN_MORE, (docsLink: DocsLink, i: number) => (
                  <LearnMoreCard key={i} docsData={docsLink} />
                ))}
              </Stack>
            )}
          </Card>
        </Flex>
      </Stack>
    </Layout>
  );
};

export default Home;
