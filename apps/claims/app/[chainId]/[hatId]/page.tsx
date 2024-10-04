import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { EligibilityContextProvider } from 'contexts';
import { first, get, pick, split, toNumber } from 'lodash';
import { Conditions, Header } from 'modules-ui';
import { BottomMenu } from 'molecules';
import { Metadata } from 'next';
import { Claims } from 'pages';
import { SupportedChains } from 'types';
import { HatDeco } from 'ui';
import { fetchHatsDetailsMesh } from 'utils';
import { Hex } from 'viem';

const TreeDetails = ({ params: { hatId, chainId } }: TreeDetailsProps) => {
  if (!hatId) return null;
  const hexHatId = hatIdDecimalToHex(hatIdIpToDecimal(hatId));

  // TODO handle unexpected chainIds that won't produce valid numbers

  return (
    <EligibilityContextProvider
      hatId={hexHatId}
      chainId={toNumber(chainId) as SupportedChains}
    >
      <div className='relative h-full w-full'>
        <div className='mx-auto h-auto w-auto max-w-7xl md:h-screen md:w-screen'>
          <div className='flex flex-col-reverse gap-8 pt-0 md:flex-row md:gap-10 md:pt-[120px] 2xl:gap-24'>
            <div className='md:w-[65%] md:max-w-[65%]'>
              <Claims />
            </div>

            <div className='right-0 flex w-full flex-col-reverse items-center gap-6 overflow-y-auto md:fixed md:w-[28%] md:flex-col md:gap-2 md:pr-10 lg:w-[30%] lg:pr-10 xl:w-[31%] xl:pr-24 2xl:flex'>
              <Conditions />

              <Header />
            </div>
          </div>

          <HatDeco height='250px' />
        </div>

        <BottomMenu />
      </div>
    </EligibilityContextProvider>
  );
};

interface TreeDetailsProps {
  params: {
    hatId: Hex;
    chainId: SupportedChains;
  };
}

export async function generateMetadata({
  params,
}: TreeDetailsProps): Promise<Metadata> {
  // read route params
  const { hatId, chainId } = pick(params, ['hatId', 'chainId']);
  // hatId is in IP format
  if (!chainId || !hatId || isNaN(toNumber(first(split(hatId, '.'))))) {
    return {};
  }
  const hatIdHex = hatIdDecimalToHex(hatIdIpToDecimal(hatId));

  // fetch data
  return fetchHatsDetailsMesh([hatIdHex], toNumber(chainId))
    .then((hats) => {
      const hat = first(hats);
      const detailsMetadata = get(hat, 'detailsMetadata');
      const detailsObject = detailsMetadata
        ? get(JSON.parse(detailsMetadata), 'data')
        : {};

      return {
        title: get(detailsObject, 'name'),
        description: get(detailsObject, 'description'),
      };
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      return {};
    });
}

export default TreeDetails;
