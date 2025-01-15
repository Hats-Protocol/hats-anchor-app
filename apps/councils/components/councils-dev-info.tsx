'use client';

import { hatIdDecimalToIp, hatIdHexToDecimal, hatIdToTreeId, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { useCouncilDetails } from 'hooks';
import { compact, get, size } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import { useMemo } from 'react';
import { SupportedChains } from 'types';
import { ChakraNextLink, DevInfo } from 'ui';
import { formatAddress, hatLink } from 'utils';
import { explorerUrl, parseCouncilSlug } from 'utils';
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
            <ChakraNextLink
              href={hatLink({ chainId: chainId as SupportedChains, hatId: primarySignerHat.id })}
              decoration
            >
              {hatIdDecimalToIp(hatIdHexToDecimal(primarySignerHat.id))}
            </ChakraNextLink>
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
            <ChakraNextLink href={`${explorerUrl(chainId || undefined)}/address/${eligibilityModule}`} decoration>
              {formatAddress(eligibilityModule)}
            </ChakraNextLink>
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
            <ChakraNextLink href={`${explorerUrl(chainId || undefined)}/address/${councilDetails?.safe}`} decoration>
              {formatAddress(councilDetails?.safe)}
            </ChakraNextLink>
          ),
        },
        {
          label: 'HSG Address',
          descriptor: (
            <ChakraNextLink href={`${explorerUrl(chainId || undefined)}/address/${councilDetails?.id}`} decoration>
              {formatAddress(councilDetails?.id)}
            </ChakraNextLink>
          ),
        },
        ownerHat && {
          label: 'Owner Hat',
          descriptor: (
            <ChakraNextLink href={hatLink({ chainId: chainId as SupportedChains, hatId: ownerHat.id })} decoration>
              {hatIdDecimalToIp(hatIdHexToDecimal(ownerHat.id))}
            </ChakraNextLink>
          ),
        },
        topHatId && {
          label: 'Top Hat',
          descriptor: (
            <ChakraNextLink href={hatLink({ chainId: chainId as SupportedChains, hatId: topHatId })} decoration>
              {hatIdDecimalToIp(hatIdHexToDecimal(topHatId))}
            </ChakraNextLink>
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

export default CouncilsDevInfo;
