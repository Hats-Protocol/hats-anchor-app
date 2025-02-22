'use client';

import { Ruleset } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp, hatIdHexToDecimal, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useToast } from 'hooks';
import { get, map } from 'lodash';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { AppHat, SupportedChains } from 'types';
import { Button, Link } from 'ui';
import { explorerUrl, formatAddress, ipfsUrl } from 'utils';

const CopyAddress = dynamic(() => import('icons').then((mod) => mod.CopyAddress));

const HatDevDetails = ({
  selectedHat,
  eligibilityInfo,
  chainId,
  isClaimable,
  showDetailsButton = false,
}: HatDevDetailsProps) => {
  const treeId = selectedHat?.id ? hatIdToTreeId(BigInt(selectedHat.id)) : null;
  const { toast } = useToast();

  const devData = useMemo(() => {
    if (!selectedHat) return [];
    return [
      { label: 'Eligibility', value: selectedHat.eligibility },
      { label: 'Toggle', value: selectedHat.toggle },
    ];
  }, [selectedHat]);

  const ipId = useMemo(() => {
    if (!selectedHat) return null;
    return hatIdDecimalToIp(hatIdHexToDecimal(selectedHat.id));
  }, [selectedHat]);

  const isDev = posthog.isFeatureEnabled('dev'); // || process.env.NODE_ENV !== 'production';

  if (!isDev) return null;

  return (
    <div className='flex flex-col gap-6 px-4 md:px-16'>
      <h2 className='font-medium'>Dev Info</h2>

      <div className='flex flex-col gap-2'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <p className='text-sm uppercase'>Image URI:</p>
            <Link href={ipfsUrl(selectedHat?.imageUri)} isExternal>
              <p className='max-w-[250px] truncate lg:max-w-[350px]'>
                {selectedHat?.imageUri !== '' ? selectedHat?.imageUri : 'Empty'}
              </p>
            </Link>
          </div>
          <div className='flex items-center gap-2'>
            <p className='text-sm uppercase'>Details URI:</p>
            <Link href={ipfsUrl(selectedHat?.details)} isExternal>
              <p className='max-w-[250px] truncate lg:max-w-[350px]'>
                {selectedHat?.details !== '' ? selectedHat?.details : 'Empty'}
              </p>
            </Link>
          </div>

          <div className='flex items-center gap-2'>
            <p className='text-sm uppercase'>Claimable:</p>
            <p>{isClaimable?.for ? 'For' : isClaimable?.by ? 'By' : 'None'}</p>
          </div>

          <div className='flex items-center gap-2'>
            <p className='text-sm uppercase'>Current Supply:</p>
            <p>
              {selectedHat?.currentSupply} / {selectedHat?.maxSupply}
            </p>
          </div>
        </div>

        {map(devData, (data) => {
          const devDataClick = () => {
            const value = get(data, 'value');

            if (!value) return;
            navigator.clipboard.writeText(value);
            toast({
              title: 'Copied to clipboard',
            });
          };

          return (
            <div className='flex items-center gap-2' key={`${get(data, 'label')}-${get(data, 'value')}`}>
              <span className='text-sm uppercase'>{get(data, 'label')}:</span>{' '}
              <Link href={`${explorerUrl(chainId)}/address/${get(data, 'value')}`} isExternal>
                <pre>{formatAddress(get(data, 'value'))}</pre>
              </Link>
              <Button variant='link' onClick={devDataClick}>
                <CopyAddress className='size-4' />
              </Button>
            </div>
          );
        })}
      </div>

      {eligibilityInfo && (
        <>
          <hr className='border-gray-200' />

          <div className='flex flex-col gap-2'>
            <h3 className='font-medium'>Eligibility Rules</h3>

            {eligibilityInfo.map((ruleSet) =>
              map(ruleSet, (rule) => (
                <div key={rule.address} className='flex items-center gap-1'>
                  <p>{rule.module.name}</p>
                  <pre>
                    (
                    <Link href={`${explorerUrl(chainId)}/address/${rule.address}`} className='underline' isExternal>
                      {formatAddress(rule.address)}
                    </Link>
                    )
                  </pre>
                </div>
              )),
            )}
          </div>
        </>
      )}

      {showDetailsButton && (
        <div className='flex gap-2'>
          <Link href={`/trees/${chainId}/${treeId}/${ipId}/details`}>
            <Button size='sm' variant='outline'>
              View Details Changes
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

interface HatDevDetailsProps {
  selectedHat: AppHat | undefined;
  eligibilityInfo: Ruleset[] | undefined;
  chainId: SupportedChains;
  isClaimable: { for: boolean; by: boolean } | undefined;
  showDetailsButton?: boolean;
}

export { HatDevDetails };
