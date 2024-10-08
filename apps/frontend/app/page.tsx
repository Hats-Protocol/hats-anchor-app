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
      <div className='fixed z-[-5] mt-[58px] h-full w-full bg-blue-100 opacity-[0.7] md:mt-[70px]' />

      <div className='z-2 mx-auto flex max-w-[1400px] flex-col gap-10 px-5 py-[100px] md:px-20 md:py-[120px]'>
        <MyHats />

        <div className='flex w-full flex-col items-start gap-10'>
          <div className='flex w-full flex-1 flex-col gap-10'>
            <Card className='min-h-[320px] bg-white bg-opacity-50 px-9 py-8'>
              <div className='flex w-full flex-col gap-4'>
                <h2 className='text-2xl font-semibold tracking-tight'>
                  Explore featured trees
                </h2>

                <div className='grid grid-cols-1 flex-wrap justify-between gap-6 md:grid-cols-3'>
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

                <div className='flex min-h-32 items-center justify-center md:hidden'>
                  <LinkButton href={`/trees/${chainId}`}>
                    View All Trees
                  </LinkButton>
                </div>
              </div>
            </Card>

            <Card className='bg-white bg-opacity-50 px-9 py-8'>
              <div className='flex flex-col gap-4'>
                <h2 className='text-2xl font-semibold tracking-tight'>
                  New Integrations
                </h2>

                <div className='flex flex-col flex-wrap justify-between gap-6 md:flex-row'>
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

          <Card className='mx-auto max-w-[427px] bg-white bg-opacity-50 px-9 py-8 md:max-w-none'>
            <div className='flex flex-col gap-4'>
              <h2 className='text-2xl font-semibold tracking-tight'>
                Learn more about Hats
              </h2>

              <div className='grid w-full grid-cols-1 gap-6 md:grid-cols-2'>
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
