'use client';

import { Button, Icon } from '@chakra-ui/react';
import { hatIdDecimalToHex, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails } from 'hats-hooks';
import { get } from 'lodash';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BsArrowLeft } from 'react-icons/bs';
import { getPathParams } from 'utils';

const ReturnToTreeList = () => {
  const pathname = usePathname();
  const { chainId, treeId } = getPathParams(pathname);
  const topHatId = treeId
    ? hatIdDecimalToHex(treeIdToTopHatId(treeId))
    : undefined;

  const { data: topHat } = useHatDetails({ hatId: topHatId, chainId });
  const topHatRawDetails = get(topHat, 'detailsMetadata');
  const topHatDetails = topHatRawDetails
    ? get(JSON.parse(topHatRawDetails), 'data')
    : undefined;

  return (
    <Link href={`/trees/${chainId}/${treeId}`}>
      <Button leftIcon={<Icon as={BsArrowLeft} />} h='40px' variant='outline'>
        {get(topHatDetails, 'name', get(topHat, 'details'))}
      </Button>
    </Link>
  );
};

export default ReturnToTreeList;
