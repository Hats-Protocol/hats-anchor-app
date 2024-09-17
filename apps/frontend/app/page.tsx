import {
  INTEGRATION_CARDS,
  LEARN_MORE,
  TemplateData,
} from '@hatsprotocol/constants';
import { find, get, map } from 'lodash';
import dynamic from 'next/dynamic';
import { DocsLink } from 'types';
import { Card, LinkButton } from 'ui';
import { fetchFeaturedTrees, fetchFeaturedTreesData } from 'utils';

const MyHats = dynamic(() => import('molecules').then((mod) => mod.MyHats), {
  ssr: false,
});
const FeaturedTreeCard = dynamic(
  () => import('molecules').then((mod) => mod.FeaturedTreeCard),
  {
    ssr: false,
  },
);
const IntegrationCard = dynamic(() =>
  import('molecules').then((mod) => mod.IntegrationCard),
);
const LearnMoreCard = dynamic(() =>
  import('molecules').then((mod) => mod.LearnMoreCard),
);

const RootPage = async () => {
  const featuredTrees = fetchFeaturedTrees();
  const hatsAndWearers = await fetchFeaturedTreesData({ featuredTrees });
  const chainId = 10;

  return (
    <>
      <div className='w-full h-full bg-blue-100 fixed opacity-[0.7] z-[-5] mt-[58px] md:mt-[70px]' />

      <div className='flex flex-col gap-10 px-5 md:px-20 py-[100px] md:py-[120px] z-2 max-w-[1400px] mx-auto'>
        <MyHats />

        <div className='flex flex-col items-start gap-10 w-full'>
          <div className='flex flex-col gap-10 flex-1 w-full'>
            <Card className='py-8 px-9 bg-white bg-opacity-50 min-h-[320px]'>
              <div className='flex flex-col w-full gap-4'>
                <h2 className='text-2xl font-semibold tracking-tight'>
                  Explore featured trees
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-3 flex-wrap gap-6 justify-between'>
                  {map(featuredTrees, (tree: TemplateData, i: number) => (
                    <FeaturedTreeCard
                      treeData={tree}
                      hatsAndWearers={
                        find(
                          hatsAndWearers,
                          (h: { treeId: string }) =>
                            Number(h.treeId) === tree.id,
                        ) as any
                      }
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

                <div className='flex flex-col md:flex-row gap-6 flex-wrap justify-between'>
                  {map(INTEGRATION_CARDS, (integration) => (
                    <IntegrationCard
                      integration={integration}
                      key={get(integration, 'label')}
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
                {map(LEARN_MORE, (docsLink: DocsLink, i: number) => (
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
