'use client';

import { Button, Icon, Text } from '@chakra-ui/react';
import { hatIdDecimalToHex, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails } from 'hats-hooks';
import { get } from 'lodash';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BsArrowLeft } from 'react-icons/bs';
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
      <Button leftIcon={<Icon as={BsArrowLeft} />} h='40px' maxW='180px' variant='outline'>
        <Text as='span' isTruncated>
          {get(topHatDetails, 'name', get(topHat, 'details'))}
        </Text>
      </Button>
    </Link>
  );
};

export { ReturnToTreeList };
