'use client';

import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { get, map } from 'lodash';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { Button, Link } from 'ui';
import { explorerUrl, formatAddress, ipfsUrl } from 'utils';

const CopyAddress = dynamic(() => import('icons').then((mod) => mod.CopyAddress));

const HatDevDetails = () => {
  const { treeId } = useTreeForm();
  const { selectedHat, eligibilityInfo, chainId, isClaimable } = useSelectedHat();

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

  const isDev = posthog?.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';

  if (!isDev) return null;

  return (
    <div className='flex flex-col gap-6 px-4 md:px-16'>
      <h2 className='font-bold'>Dev Info</h2>

      <div className='flex flex-col gap-2'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <p className='font-medium'>Image URI:</p>
            <Link href={ipfsUrl(selectedHat?.imageUri)} isExternal>
              <p className='max-w-[250px] truncate lg:max-w-[350px]'>
                {selectedHat?.imageUri !== '' ? selectedHat?.imageUri : 'Empty'}
              </p>
            </Link>
          </div>
          <div className='flex items-center gap-2'>
            <p className='font-medium'>Details URI:</p>
            <Link href={ipfsUrl(selectedHat?.details)} isExternal>
              <p className='max-w-[250px] truncate lg:max-w-[350px]'>
                {selectedHat?.details !== '' ? selectedHat?.details : 'Empty'}
              </p>
            </Link>
          </div>

          <div className='flex items-center gap-2'>
            <p className='font-medium'>Claimable:</p>
            <p>{isClaimable?.for ? 'For' : isClaimable?.by ? 'Any' : 'None'}</p>
          </div>
        </div>

        {map(devData, (data) => {
          const devDataClick = () => {
            const value = get(data, 'value');

            if (!value) return;
            navigator.clipboard.writeText(value);
            // TODO toast
          };

          return (
            <div className='flex gap-2' key={`${get(data, 'label')}-${get(data, 'value')}`}>
              <span className='font-medium'>{get(data, 'label')}:</span>{' '}
              <Link href={`${explorerUrl(chainId)}/address/${get(data, 'value')}`} isExternal>
                {formatAddress(get(data, 'value'))}
              </Link>
              <Button variant='outline' onClick={devDataClick}>
                <CopyAddress />
              </Button>
            </div>
          );
        })}
      </div>

      {eligibilityInfo && (
        <>
          <hr className='border-gray-200' />

          <div className='flex flex-col gap-2'>
            <h3 className='font-bold'>Eligibility Rules</h3>

            {eligibilityInfo.map((ruleSet) =>
              map(ruleSet, (rule) => (
                <div key={rule.address}>
                  {rule.module.name} (
                  <Link href={`${explorerUrl(chainId)}/address/${rule.address}`} className='underline' isExternal>
                    {formatAddress(rule.address)}
                  </Link>
                  )
                </div>
              )),
            )}
          </div>
        </>
      )}

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

export { HatDevDetails };
