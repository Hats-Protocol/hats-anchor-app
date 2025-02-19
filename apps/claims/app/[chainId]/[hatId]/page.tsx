import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { EligibilityContextProvider } from 'contexts';
import { first, get, split, toNumber } from 'lodash';
import { ClaimsConditions, Header } from 'modules-ui';
import { HatDevDetailsClaims } from 'molecules';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Claims, ClaimsHelperButtons, StandaloneBottomMenu } from 'organisms';
import { SupportedChains } from 'types';
import { HatDeco } from 'ui';
import { fetchHatsDetailsMesh, logger } from 'utils';
import { Hex } from 'viem';

const TreeDetails = async ({ params }: TreeDetailsProps) => {
  const { hatId, chainId } = await params;
  if (!hatId || !chainId || isNaN(toNumber(first(split(hatId, '.'))))) {
    notFound(); // TODO catch other invalid hatIds
  }
  const hexHatId = hatIdDecimalToHex(hatIdIpToDecimal(hatId));

  // TODO handle unexpected chainIds that won't produce valid numbers
  // TODO handle chainIds that are not supported

  return (
    <EligibilityContextProvider hatId={hexHatId} chainId={toNumber(chainId) as SupportedChains}>
      <div className='relative h-full w-full'>
        <div className='mx-auto h-auto w-auto max-w-7xl md:h-screen md:w-screen'>
          <div className='md:grid-cols-20 flex flex-col-reverse pt-0 md:grid md:pt-[120px]'>
            <div className='hidden md:col-span-11 md:col-start-2 md:grid'>
              <Claims />
            </div>

            <div className='md:col-start-14 flex w-full flex-col-reverse items-center gap-6 overflow-y-auto md:col-span-6 md:flex-col'>
              <ClaimsConditions />

              <Header />

              <div className='hidden 2xl:block'>
                <ClaimsHelperButtons stackVertically />
              </div>
            </div>
          </div>

          <div>
            <HatDevDetailsClaims />
          </div>

          <div className='min-h-[250px]'>
            <HatDeco />
          </div>
        </div>

        <StandaloneBottomMenu />
      </div>
    </EligibilityContextProvider>
  );
};

interface TreeDetailsProps {
  params: Promise<{
    hatId: Hex | string;
    chainId: SupportedChains;
  }>;
}

export async function generateMetadata({ params }: TreeDetailsProps): Promise<Metadata> {
  // read route params
  const { hatId, chainId } = await params;
  // hatId is in IP format
  if (!chainId || !hatId || hatId === 'undefined' || isNaN(toNumber(first(split(hatId, '.'))))) {
    // TODO why is Next still pinging /chainId/hatId when hatId is not found?
    return {};
  }
  const hatIdHex = hatIdDecimalToHex(hatIdIpToDecimal(hatId));

  // fetch data
  return fetchHatsDetailsMesh([hatIdHex], toNumber(chainId))
    .then((hats) => {
      const hat = first(hats);
      const detailsMetadata = get(hat, 'detailsMetadata');
      const detailsObject = detailsMetadata ? get(JSON.parse(detailsMetadata), 'data') : {};

      return {
        title: get(detailsObject, 'name'),
        description: get(detailsObject, 'description'),
      };
    })
    .catch((err) => {
      logger.error(err);
      return {};
    });
}

export default TreeDetails;
