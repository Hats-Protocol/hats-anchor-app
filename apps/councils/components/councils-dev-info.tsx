'use client';

import { hatIdDecimalToIp, hatIdHexToDecimal, hatIdToTreeId, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { useCouncilDetails } from 'hooks';
import { compact, get, size } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import { DevInfo } from 'molecules';
import { useMemo } from 'react';
import { SupportedChains } from 'types';
import { Link } from 'ui';
import { explorerUrl, formatAddress, hatLink, parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

import { EligibilityRulesDevInfo } from './eligibility-rules-dev-info';

const CouncilsDevInfo = ({ slug }: { slug: string }) => {
  const { chainId, address } = parseCouncilSlug(slug);

  const { data: councilDetails } = useCouncilDetails({
    chainId: chainId ?? 11155111,
    address,
  });
  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const ownerHat = get(councilDetails, 'ownerHat');
  const topHatId = primarySignerHat?.id
    ? (treeIdToTopHatId(hatIdToTreeId(BigInt(primarySignerHat.id))).toString() as Hex)
    : undefined; // TODO forgoing getting top hat details for now
  const eligibilityModule = get(primarySignerHat, 'eligibility') as Hex | undefined;
  const { data: eligibilityRules } = useEligibilityRules({
    chainId: chainId as SupportedChains,
    address: eligibilityModule,
  });

  // TODO easy way to get MCH details?

  const hatInfo = useMemo(
    () =>
      compact([
        primarySignerHat && {
          label: 'Primary Signer Hat',
          descriptor: (
            <Link
              href={hatLink({ chainId: chainId as SupportedChains, hatId: primarySignerHat.id })}
              className='underline'
            >
              {hatIdDecimalToIp(hatIdHexToDecimal(primarySignerHat.id))}
            </Link>
          ),
        },
        {
          label: 'Current Wearers',
          descriptor: <div>{size(primarySignerHat?.wearers)}</div>,
        },
        {
          label: 'Safe Signers',
          descriptor: <div>{0}</div>,
        },
        {
          label: 'Max Supply',
          descriptor: <div>{primarySignerHat?.maxSupply}</div>,
        },

        eligibilityModule && {
          label: 'Eligibility',
          descriptor: (
            <Link href={`${explorerUrl(chainId || undefined)}/address/${eligibilityModule}`} className='underline'>
              {formatAddress(eligibilityModule)}
            </Link>
          ),
        },
      ]),
    [eligibilityModule, chainId, primarySignerHat],
  );

  const hsgInfo = useMemo(
    () =>
      compact([
        {
          label: 'Safe Address',
          descriptor: (
            <Link href={`${explorerUrl(chainId || undefined)}/address/${councilDetails?.safe}`} className='underline'>
              {formatAddress(councilDetails?.safe)}
            </Link>
          ),
        },
        {
          label: 'HSG Address',
          descriptor: (
            <Link href={`${explorerUrl(chainId || undefined)}/address/${councilDetails?.id}`} className='underline'>
              {formatAddress(councilDetails?.id)}
            </Link>
          ),
        },
        ownerHat && {
          label: 'Owner Hat',
          descriptor: (
            <Link href={hatLink({ chainId: chainId as SupportedChains, hatId: ownerHat.id })} className='underline'>
              {hatIdDecimalToIp(hatIdHexToDecimal(ownerHat.id))}
            </Link>
          ),
        },
        topHatId && {
          label: 'Top Hat',
          descriptor: (
            <Link href={hatLink({ chainId: chainId as SupportedChains, hatId: topHatId })} className='underline'>
              {hatIdDecimalToIp(hatIdHexToDecimal(topHatId))}
            </Link>
          ),
        },
      ]),
    [councilDetails, chainId, ownerHat, topHatId],
  );

  if (!chainId) return null;

  return (
    <div className='mx-auto flex w-1/2 flex-col gap-4'>
      <DevInfo title='Hat Info' devInfos={hatInfo} />

      <DevInfo title='HSG Info' devInfos={hsgInfo} />

      <EligibilityRulesDevInfo chainId={chainId} eligibilityRules={eligibilityRules || undefined} />
    </div>
  );
};

export { CouncilsDevInfo };
