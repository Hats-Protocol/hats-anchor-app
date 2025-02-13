'use client';

import { NETWORK_IMAGES } from '@hatsprotocol/config';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useMediaStyles } from 'hooks';
import { get } from 'lodash';
import { AppHat } from 'types';
import { Card, LazyImage, Link, Tooltip } from 'ui';
import { chainsMap, ipfsUrl } from 'utils';

const DashboardHatCard = ({ hat }: HatCardProps) => {
  const { isMobile } = useMediaStyles();

  const image = ipfsUrl(get(hat, 'nearestImage'));
  const hatRawDetails = get(hat, 'detailsMetadata');
  const hatDetails = hatRawDetails ? get(JSON.parse(hatRawDetails), 'data') : undefined;

  const hatLink = isMobile
    ? `trees/${hat.chainId}/${Number(hatIdToTreeId(BigInt(hat.id)))}/${hatIdDecimalToIp(BigInt(hat.id))}`
    : `trees/${hat.chainId}/${Number(hatIdToTreeId(BigInt(hat.id)))}?hatId=${hatIdDecimalToIp(BigInt(hat.id))}`;

  return (
    <Link href={hatLink} className='rounded-md shadow hover:no-underline'>
      <Card className='h-24 overflow-hidden rounded-md p-4'>
        <div className='flex w-full items-center gap-4'>
          <div className='size-16'>
            <LazyImage
              src={hat ? image : undefined}
              alt={`${get(hatDetails, 'name', get(hat, 'details'))} image`}
              containerClassName='size-16 rounded-md'
              // boxSize={72}
            />
          </div>

          <div className='max-w-3/4'>
            <Tooltip label={get(hatDetails, 'name', get(hat, 'details'))}>
              <h1 className='text-md font-medium'>{get(hatDetails, 'name', get(hat, 'details'))}</h1>
            </Tooltip>

            <div className='flex items-center gap-4'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-black/10'>
                <img src={NETWORK_IMAGES[hat.chainId || 1]} alt={`${chainsMap(hat.chainId)?.name}`} />
              </div>

              <p className='text-md font-medium'>#{Number(hatIdToTreeId(BigInt(hat.id)))}</p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

interface HatCardProps {
  hat: AppHat;
}

export { DashboardHatCard };
