import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  HStack,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useMediaQuery,
} from '@chakra-ui/react';
import _ from 'lodash';
import { Suspense } from 'react';
import { BsDiagram3 } from 'react-icons/bs';
import { FaArrowRight } from 'react-icons/fa';
import { useAccount, useEnsName } from 'wagmi';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import Suspender from '@/components/atoms/Suspender';
import DashboardHatCard from '@/components/DashboardHatCard';
import FeaturedTreeCard from '@/components/FeaturedTreeCard';
import ForkableTemplateCard from '@/components/ForkableTemplateCard';
import Layout from '@/components/Layout';
import LearnMoreCard from '@/components/LearnMoreCard';
import CONFIG, {
  featuredTemplates,
  featuredTrees,
  learnMore,
} from '@/constants';
import useFeaturedTrees from '@/hooks/useFetchFeaturedTrees';
import useImageURIs from '@/hooks/useImageURIs';
import useWearerDetails from '@/hooks/useWearerDetails';
import { formatAddress } from '@/lib/general';
import { orderedChains } from '@/lib/web3';

const Home = () => {
  const { address: wearerAddress } = useAccount();
  const hatsAndWearers = useFeaturedTrees(featuredTrees);

  const [isSmallerScreen] = useMediaQuery('(max-width: 1700px)');

  const { data: currentHats, isLoading: detailsLoading } = useWearerDetails({
    wearerAddress,
    chainId: 'all',
  });

  const { data: currentHatsWithImagesData, isLoading: imagesLoading } =
    useImageURIs(currentHats);

  const sortedHats = _.sortBy(currentHatsWithImagesData, (hat) => {
    return _.indexOf(orderedChains, hat.chainId);
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
              <Text fontSize={18}>
                Here&apos;s what&apos;s happening with your Hats
              </Text>
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

        {wearerAddress && (
          <Card py={8} px={9} background='whiteAlpha.600' gap={4}>
            <Flex justifyContent='space-between' alignItems='center'>
              <Text fontSize={24} fontWeight='medium'>
                Your Hats
              </Text>
              {sortedHats.length > 8 && (
                <ChakraNextLink
                  as={ChakraNextLink}
                  href={`/wearers/${wearerAddress}`}
                >
                  <HStack alignItems='center'>
                    <Text>View All of Your Hats</Text> <FaArrowRight />
                  </HStack>
                </ChakraNextLink>
              )}
            </Flex>
            {imagesLoading || detailsLoading ? (
              <Flex justify='center' align='center' pt={10}>
                <Spinner />
              </Flex>
            ) : (
              <SimpleGrid
                columns={{
                  base: 1,
                  sm: 2,
                  md: 3,
                  lg: 4,
                }}
                spacing={6}
              >
                {_.map(sortedHats.slice(0, 8), (hat, i) => (
                  <Suspense fallback={<Suspender />} key={i}>
                    <DashboardHatCard hat={hat} key={i} />
                  </Suspense>
                ))}
              </SimpleGrid>
            )}
          </Card>
        )}

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
                {_.map(featuredTrees, (tree, i) => (
                  <Suspense key={i} fallback={<Suspender />}>
                    <FeaturedTreeCard
                      treeData={tree}
                      hatsAndWearers={_.find(
                        hatsAndWearers,
                        (h: { treeId: string }) => Number(h.treeId) === tree.id,
                      )}
                    />
                  </Suspense>
                ))}
              </SimpleGrid>
            </Card>

            <Card py={8} px={9} background='whiteAlpha.600' gap={4}>
              <Text fontSize={24} fontWeight='medium'>
                Jump right in with a forkable template
              </Text>
              <SimpleGrid columns={3} spacing={6}>
                {_.map(featuredTemplates, (tree, i) => (
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
                {_.map(learnMore, (docsLink, i) => (
                  <LearnMoreCard key={i} docsData={docsLink} />
                ))}
              </Grid>
            ) : (
              <Stack spacing={6}>
                {_.map(learnMore, (docsLink, i) => (
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
