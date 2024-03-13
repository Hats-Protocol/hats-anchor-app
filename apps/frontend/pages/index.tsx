import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  HStack,
  SimpleGrid,
  Skeleton,
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
import { useWearerDetails } from 'hats-hooks';
import {
  useFeaturedTemplates,
  useFeaturedTrees,
  useFeaturedTreesData,
  useImageURIs,
  useMediaStyles,
} from 'hooks';
import _ from 'lodash';
import { BsDiagram3 } from 'react-icons/bs';
import { FaArrowRight } from 'react-icons/fa';
import { AppHat, DocsLink } from 'types';
import {
  ChakraNextLink,
  DashboardHatCard,
  FeaturedTreeCard,
  ForkableTemplateCard,
  Layout,
  LearnMoreCard,
} from 'ui';
import { formatAddress } from 'utils';
import { useAccount, useEnsName } from 'wagmi';

const HATS_TO_SHOW = 8;
const MOBILE_HATS_TO_SHOW = 4;

const Home = () => {
  const { address: wearerAddress } = useAccount();
  const { data: featuredTemplates, isLoading: templatesLoading } =
    useFeaturedTemplates();
  const { data: featuredTrees, isLoading: featuredTreesLoading } =
    useFeaturedTrees();
  const { data: hatsAndWearers, isLoading: featuredTreesDataLoading } =
    useFeaturedTreesData(featuredTrees);

  const { isMobile } = useMediaStyles();
  const [upTo1700] = useMediaQuery('(max-width: 1700px)');

  const { data: currentHats, isLoading: wearerDetailsLoading } =
    useWearerDetails({
      wearerAddress,
      chainId: 'all',
    });

  const sortedHats = _.sortBy(_.compact(currentHats), (hat: AppHat) => {
    return _.indexOf(orderedChains, hat?.chainId);
  });
  const activeHats = _.filter(sortedHats, ['status', true]);

  const { data: currentHatsWithImagesData, isLoading: imagesLoading } =
    useImageURIs({
      hats: activeHats
        ? activeHats.splice(0, isMobile ? MOBILE_HATS_TO_SHOW : HATS_TO_SHOW)
        : [],
    });

  const { data: ensName } = useEnsName({ address: wearerAddress, chainId: 1 });
  console.log(
    !!wearerAddress,
    !!currentHatsWithImagesData,
    wearerDetailsLoading,
    imagesLoading,
  );

  return (
    <Layout hideBackLink>
      <Box
        w='100%'
        h='100%'
        bg='blue'
        position='fixed'
        opacity={0.07}
        zIndex={-1}
      />
      <Stack spacing={10} px={{ base: 5, md: 20 }} py={{ base: 100, md: 120 }}>
        {wearerAddress ? (
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justifyContent='space-between'
            gap={10}
          >
            <Stack>
              <Heading variant='medium'>
                gm {ensName || formatAddress(wearerAddress)} 👋
              </Heading>
              {!_.isEmpty(sortedHats) && (
                <Text size='lg'>
                  Here&apos;s what&apos;s happening with your hats
                </Text>
              )}
            </Stack>

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
          </Flex>
        ) : (
          <Stack>
            <Heading variant='medium'>Welcome to Hats Protocol! 🧢</Heading>
            <Text size='lg'>Please connect your wallet to get started.</Text>
          </Stack>
        )}

        {wearerAddress && (
          <Skeleton
            isLoaded={wearerAddress && !wearerDetailsLoading}
            minH='300px'
          >
            {currentHatsWithImagesData &&
              (!_.isEmpty(sortedHats) ? (
                <Card py={8} px={9} background='whiteAlpha.600' gap={4}>
                  <Flex justifyContent='space-between' alignItems='center'>
                    <Heading variant='medium'>Your hats</Heading>
                    {_.size(sortedHats) >
                      (isMobile ? MOBILE_HATS_TO_SHOW : HATS_TO_SHOW) && (
                      <ChakraNextLink
                        as={ChakraNextLink}
                        href={`/wearers/${wearerAddress}`}
                      >
                        <HStack alignItems='center'>
                          <Text>
                            View {!isMobile ? 'all of ' : ''}your hats
                          </Text>
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
                      lg: 4,
                    }}
                    spacing={6}
                  >
                    {_.map(
                      currentHatsWithImagesData,
                      (hat: AppHat, i: number) => (
                        <DashboardHatCard hat={hat} key={i} />
                      ),
                    )}
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
          </Skeleton>
        )}

        <Flex alignItems='start' gap={10} direction='column' w='100%'>
          <Stack spacing={10} flex={1} w='100%'>
            <Skeleton
              isLoaded={!featuredTreesLoading && !featuredTreesDataLoading}
            >
              <Card py={8} px={9} background='whiteAlpha.600' gap={4} h='320px'>
                <Heading variant='medium'>Explore featured trees</Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
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
            </Skeleton>

            <Card py={8} px={9} background='whiteAlpha.600' gap={4}>
              <Heading variant='medium'>
                Jump right in with a forkable template
              </Heading>
              <Skeleton isLoaded={!templatesLoading} minH='170px' w='100%'>
                {!_.isEmpty(featuredTemplates) ? (
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    {_.map(
                      featuredTemplates,
                      (tree: TemplateData, i: number) => (
                        <ForkableTemplateCard key={i} treeData={tree} />
                      ),
                    )}
                  </SimpleGrid>
                ) : (
                  <Flex justify='center' align='center' w='full' h='full'>
                    <Heading>No templates</Heading>
                  </Flex>
                )}
              </Skeleton>
            </Card>
          </Stack>

          <Card
            py={8}
            px={9}
            background='whiteAlpha.600'
            gap={4}
            maxW={{ base: '427px', md: '100%' }}
          >
            <Heading variant='medium'>Learn more about Hats</Heading>
            {upTo1700 ? (
              <Grid
                templateColumns={{
                  base: 'repeat(1, 1fr)',
                  md: 'repeat(2, 1fr)',
                }}
                gap={6}
              >
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
