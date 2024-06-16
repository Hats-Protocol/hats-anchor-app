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
  LinkButton,
  MyHats,
} from 'ui';
import { fetchFeaturedTrees, fetchFeaturedTreesData } from 'utils';

const RootPage = async () => {
  const featuredTrees = fetchFeaturedTrees();
  const hatsAndWearers = await fetchFeaturedTreesData({ featuredTrees });
  const chainId = 10;

  return (
    <>
      <div className='w-full h-full bg-blue-100 fixed opacity-[0.7] z-[-5] mt-[70px]' />

      <div className='flex flex-col gap-10 px-5 md:px-20 py-[100px] md:py-[120px] z-2'>
        <MyHats />

        <div className='flex flex-col items-start gap-10 w-full'>
          <div className='flex flex-col gap-10 flex-1 w-full'>
            <Card className='py-8 px-9 bg-white bg-opacity-50 min-h-[320px]'>
              <div className='flex flex-col w-full gap-4'>
                <h2 className='text-2xl font-semibold tracking-tight'>
                  Explore featured trees
                </h2>

                <div className='flex column md:row flex-wrap gap-8 justify-between lg:justify-around'>
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

                <div className='flex justify-center md:hidden items-center min-h-32'>
                  <LinkButton href={`/trees/${chainId}`}>
                    View All Trees
                  </LinkButton>
                </div>
              </div>
            </Card>

            <Card className='py-8 px-9 bg-white bg-opacity-50'>
              <div className='flex flex-col gap-4'>
                <h2 className='text-2xl font-semibold tracking-tight'>
                  New Integrations
                </h2>

                <div className='flex flex-col md:flex-row gap-4 flex-wrap justify-between lg:justify-around'>
                  {_.map(INTEGRATION_CARDS, (integration) => (
                    <IntegrationCard
                      integration={integration}
                      key={_.get(integration, 'label')}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <Card className='py-8 px-9 bg-white bg-opacity-50 mx-auto max-w-[427px] md:max-w-none'>
            <div className='flex flex-col gap-4'>
              <h2 className='text-2xl font-semibold tracking-tight'>
                Learn more about Hats
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
                {_.map(LEARN_MORE, (docsLink: DocsLink, i: number) => (
                  <LearnMoreCard key={i} docsData={docsLink} />
                ))}
              </div>
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
