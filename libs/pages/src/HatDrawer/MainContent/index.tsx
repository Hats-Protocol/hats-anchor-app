'use client';

import { Button, Stack } from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useScrollPosition } from 'hooks';
import { get, map } from 'lodash';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AuthoritiesList, Controllers } from 'organisms';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { explorerUrl, formatAddress } from 'utils';

import WearersList from '../WearersList';
import HatHistory from './HatHistory';
import Header from './Header';
import LinkRequests from './LinkRequests';

const ResponsibilitiesList = dynamic(() =>
  import('molecules').then((mod) => mod.ResponsibilitiesList),
);
const CopyAddress = dynamic(() =>
  import('icons').then((mod) => mod.CopyAddress),
);

const MainContent = ({
  showBottomMenu,
  setShowBottomMenu,
}: {
  showBottomMenu?: boolean;
  setShowBottomMenu?: (b: boolean) => void;
}) => {
  const { treeId } = useTreeForm();
  const { selectedHat, chainId } = useSelectedHat();
  const ipId = useMemo(() => {
    if (!selectedHat) return null;
    return hatIdDecimalToIp(hatIdHexToDecimal(selectedHat.id));
  }, [selectedHat]);

  useScrollPosition(
    ({ prevPos, currPos }) => {
      const isShow = currPos.y > prevPos.y;
      // eslint-disable-next-line no-console
      console.debug('prevPos', prevPos, 'currPos', currPos, 'isShow', isShow);
      if (isShow !== showBottomMenu) setShowBottomMenu?.(isShow);
    },
    [showBottomMenu],
  );

  const devData = useMemo(() => {
    return [
      { label: 'Eligibility', value: selectedHat?.eligibility },
      { label: 'Toggle', value: selectedHat?.toggle },
    ];
  }, [selectedHat]);

  const isDev =
    posthog?.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';

  if (!selectedHat) return null;

  return (
    <Stack
      // apply x padding on components for section background handling
      spacing={8}
      w='100%'
      overflowY={{ base: 'auto', md: 'scroll' }}
      height={{ base: 'auto', md: 'calc(100% - 150px)' }}
      pb={{ base: 100, md: 400 }}
      color='blackAlpha.800'
      bg={{ base: 'gray.50', md: 'whiteAlpha.200' }}
      backdropFilter={{ base: 'none', md: 'blur(2px)' }}
    >
      <Header />

      <AuthoritiesList />

      <ResponsibilitiesList />

      <WearersList />

      <Controllers />

      <LinkRequests />

      <HatHistory />

      {isDev && (
        <div className='flex flex-col gap-6 px-16'>
          <h2 className='text-md font-bold'>Dev Info</h2>

          <div className='flex flex-col gap-2'>
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
                  <Link
                    href={`${explorerUrl(chainId)}/address/${get(data, 'value')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {get(data, 'label')}: {formatAddress(get(data, 'value'))}
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
      )}
    </Stack>
  );
};

export default MainContent;

// interface MainContentProps {
//   linkRequestFromTree: any[];
// }
