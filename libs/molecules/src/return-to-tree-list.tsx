'use client';

import { hatIdDecimalToHex, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails } from 'hats-hooks';
import { get } from 'lodash';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BsArrowLeft } from 'react-icons/bs';
import { Button } from 'ui';
import { getPathParams } from 'utils';

const ReturnToTreeList = () => {
  const pathname = usePathname();
  const { chainId, treeId, hatId } = getPathParams(pathname);
  const topHatId = treeId ? hatIdDecimalToHex(treeIdToTopHatId(treeId)) : undefined;

  const { data: topHat } = useHatDetails({ hatId: topHatId, chainId });
  const topHatRawDetails = get(topHat, 'detailsMetadata');
  const topHatDetails = topHatRawDetails ? get(JSON.parse(topHatRawDetails), 'data') : undefined;

  if (!treeId || !topHat || !hatId) return null;

  return (
    <Link href={`/trees/${chainId}/${treeId}`}>
      <Button className='h-10 max-w-40' variant='outline'>
        <BsArrowLeft className='mr-1' />

        <span className='line-clamp-1'>{get(topHatDetails, 'name', get(topHat, 'details'))}</span>
      </Button>
    </Link>
  );
};

export { ReturnToTreeList };
