'use client';

import { Button, HStack, Link, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { get, map } from 'lodash';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { ChakraNextLink } from 'ui';
import { explorerUrl, formatAddress, ipfsUrl } from 'utils';

const CopyAddress = dynamic(() =>
  import('icons').then((mod) => mod.CopyAddress),
);

const HatDevDetails = () => {
  const { treeId } = useTreeForm();
  const { selectedHat, chainId, isClaimable } = useSelectedHat();

  const devData = useMemo(() => {
    return [
      { label: 'Eligibility', value: selectedHat?.eligibility },
      { label: 'Toggle', value: selectedHat?.toggle },
    ];
  }, [selectedHat]);

  const ipId = useMemo(() => {
    if (!selectedHat) return null;
    return hatIdDecimalToIp(hatIdHexToDecimal(selectedHat.id));
  }, [selectedHat]);

  const isDev =
    posthog?.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';

  if (!isDev) return null;

  return (
    <div className='flex flex-col gap-6 px-4 md:px-16'>
      <h2 className='font-bold'>Dev Info</h2>

      <div className='flex flex-col gap-2'>
        <Stack>
          <HStack>
            <Text variant='medium'>Image URI:</Text>
            <ChakraNextLink href={ipfsUrl(selectedHat?.imageUri)} isExternal>
              <Text maxW={['250px', null, null, '350px']} isTruncated>
                {selectedHat?.imageUri !== '' ? selectedHat?.imageUri : 'Empty'}
              </Text>
            </ChakraNextLink>
          </HStack>
          <HStack>
            <Text variant='medium'>Details URI:</Text>
            <ChakraNextLink href={ipfsUrl(selectedHat?.details)} isExternal>
              <Text maxW={['250px', null, null, '350px']} isTruncated>
                {selectedHat?.details !== '' ? selectedHat?.details : 'Empty'}
              </Text>
            </ChakraNextLink>
          </HStack>

          <HStack>
            <Text variant='medium'>Claimable:</Text>
            <Text>
              {isClaimable?.for ? 'For' : isClaimable?.by ? 'Any' : 'None'}
            </Text>
          </HStack>
        </Stack>

        {map(devData, (data) => {
          const devDataClick = () => {
            const value = get(data, 'value');

            if (!value) return;
            navigator.clipboard.writeText(value);
            // toast
          };

          return (
            <div
              className='flex gap-2'
              key={`${get(data, 'label')}-${get(data, 'value')}`}
            >
              <span className='font-medium'>{get(data, 'label')}:</span>{' '}
              <Link
                href={`${explorerUrl(chainId)}/address/${get(data, 'value')}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                {formatAddress(get(data, 'value'))}
              </Link>
              <button onClick={devDataClick}>
                <CopyAddress />
              </button>
            </div>
          );
        })}
      </div>

      <div className='flex gap-2'>
        <Link href={`/trees/${chainId}/${treeId}/${ipId}/details`}>
          <Button size='sm' variant='outline'>
            View Details Changes
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HatDevDetails;
