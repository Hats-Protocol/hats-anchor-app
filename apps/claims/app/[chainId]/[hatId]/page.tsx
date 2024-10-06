import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { EligibilityContextProvider } from 'contexts';
import { first, get, pick, split, toNumber } from 'lodash';
import { ClaimsConditions, Header } from 'modules-ui';
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
  // TODO handle chainIds that are not supported

  return (
    <EligibilityContextProvider
      hatId={hexHatId}
      chainId={toNumber(chainId) as SupportedChains}
    >
      <div className='relative h-full w-full'>
        <div className='mx-auto h-auto w-auto max-w-7xl md:h-screen md:w-screen'>
          <div className='md:grid-cols-20 flex flex-col-reverse pt-0 md:grid md:pt-[120px]'>
            <div className='hidden md:col-span-11 md:col-start-2 md:grid'>
              <Claims />
            </div>

            <div className='md:col-start-14 flex w-full flex-col-reverse items-center gap-6 overflow-y-auto md:col-span-6 md:flex-col'>
              <ClaimsConditions />

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
