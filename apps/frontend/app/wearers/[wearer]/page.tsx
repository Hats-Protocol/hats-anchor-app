import { pick } from 'lodash';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { SearchParamsProps } from 'types';
import { fetchWearerDetailsMesh, formatAddress } from 'utils';

const WearerStats = dynamic(() => import('molecules').then((mod) => mod.WearerStats));
const WearerHats = dynamic(() => import('molecules').then((mod) => mod.WearerHats));
const WearerInfo = dynamic(() => import('molecules').then((mod) => mod.WearerInfo));

// TODO use new tree list cards on mobile
// TODO switch Avatar back to `OblongAvatar`, something about undefined component/default export mixup
// consider using tabs for the networks on mobile to reduce the scroll end-to-end

const WearerDetail = () => (
  <>
    <div className='fixed z-[-5] mt-[70px] h-full w-full bg-blue-100 opacity-[0.7]' />

    <div className='flex flex-col items-center gap-6 p-5 md:p-20'>
      <div className='mt-20 flex w-full flex-col justify-between gap-10 md:mt-10 md:flex-row'>
        <WearerInfo />

        <WearerStats />
      </div>

      <div className='flex w-full flex-col justify-start gap-4 p-6'>
        <div className='flex flex-col gap-2'>
          <h3 className='text-2xl font-medium'>Wearer of</h3>
        </div>

        <WearerHats />
      </div>
    </div>
  </>
);

interface MetadataProps extends SearchParamsProps {
  params: { wearer: string };
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  // read route params
  const { wearer } = pick(params, ['wearer']);

  // fetch data
  // TODO handle ens
  return fetchWearerDetailsMesh(wearer, 10)
    .then((fetchedWearer) => {
      return {
        title: `${formatAddress(wearer)}'s Hats`,
        // openGraph: {
        //   images: ['/some-specific-page-image.jpg', ...previousImages],
        // },
      };
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      return {};
    });
}

export default WearerDetail;
