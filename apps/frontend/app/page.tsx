import {
  INTEGRATION_CARDS,
  LEARN_MORE,
  TemplateData,
} from '@hatsprotocol/constants';
import _ from 'lodash';
import { DocsLink } from 'types';
import {
  Card,
  FeaturedTreeCard,
  IntegrationCard,
  LearnMoreCard,
  MyHats,
} from 'ui';
import { fetchFeaturedTrees, fetchFeaturedTreesData } from 'utils';

const RootPage = async () => {
  const featuredTrees = fetchFeaturedTrees();
  const hatsAndWearers = await fetchFeaturedTreesData({ featuredTrees });

  return (
    <>
      <div className='w-full h-full bg-blue-100 fixed opacity-[0.7] z-[-5] mt-[70px]' />

      <div className='flex flex-col gap-10 px-5 md:px-20 py-[100px] md:py-[120px] z-2'>
        <MyHats />

        <div className='flex direction-column items-start gap-10 w-full'>
          <div className='flex flex-col gap-10 flex-1 w-full'>
            <Card className='py-8 px-9 bg-white gap-4 min-h-[320px]'>
              <h3>Explore featured trees</h3>
              <div className='flex column md:row flex-wrap justify-between lg:justify-around'>
                {_.map(featuredTrees, (tree: TemplateData, i: number) => (
                  <FeaturedTreeCard
                    treeData={tree}
                    hatsAndWearers={_.find(
                      hatsAndWearers,
                      (h: { treeId: string }) => Number(h.treeId) === tree.id,
                    )}
                    key={i}
                  />
                ))}
              </div>

              {/* {isMobile && (
                  <Flex justify='center' align='center' minH='125px'>
                    <ChakraNextLink href={`/trees/${chainId || 10}`}>
                      <Button colorScheme='blue.500' variant='outlineMatch'>
                        <HStack gap={3}>
                          <BsDiagram3 />
                          <Text variant='medium' noOfLines={1}>
                            View all trees
                          </Text>
                        </HStack>
                      </Button>
                    </ChakraNextLink>
                  </Flex>
                )} */}
            </Card>

            <Card className='py-8 px-9 bg-white'>
              <div className='flex flex-col gap-4'>
                <h3>New Integrations</h3>
                <div className='flex flex-col md:flex-row flex-wrap justify-between lg:justify-around'>
                  {_.map(INTEGRATION_CARDS, (integration) => (
                    <IntegrationCard
                      integration={integration}
                      key={_.get(integration, 'label')}
                    />
                  ))}
                </div>
              </div>
            </Card>

            {/* <Card py={8} px={9} background='whiteAlpha.600' gap={4}>
              <Heading>
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
            </Card> */}
          </div>

          <Card className='py-8 px-9 bg-white gap-4 w-full mx-auto max-w-[427px] md:max-w-none'>
            <h3>Learn more about Hats</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
              {_.map(LEARN_MORE, (docsLink: DocsLink, i: number) => (
                <LearnMoreCard key={i} docsData={docsLink} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default RootPage;

// interface PageProps {
//   editMode?: boolean;
//   hatData?: AppHat;
//   hideBackLink?: boolean;
//   children: ReactNode;
// }
