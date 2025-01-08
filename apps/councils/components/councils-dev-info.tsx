'use client';

import { useCouncilDetails } from 'hooks';
import { compact, flatten, get, map } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import { useMemo } from 'react';
import { SupportedChains } from 'types';
import { ChakraNextLink, DevInfo } from 'ui';
import { formatAddress } from 'utils';
import { explorerUrl, parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

const CouncilsDevInfo = ({ slug }: { slug: string }) => {
  const { chainId, address } = parseCouncilSlug(slug);

  const { data: councilDetails, isLoading: councilDetailsLoading } = useCouncilDetails({
    chainId: chainId ?? 11155111,
    address,
  });
  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const eligibilityModule = get(primarySignerHat, 'eligibility') as Hex | undefined;
  console.log(primarySignerHat, eligibilityModule);
  const { data: eligibilityRules } = useEligibilityRules({
    chainId: chainId as SupportedChains,
    address: eligibilityModule,
  });
  console.log(eligibilityRules);

  // TODO easy way to get MCH details?

  const devInfo = useMemo(
    () =>
      compact([
        eligibilityModule && {
          label: 'Eligibility',
          descriptor: (
            <ChakraNextLink href={`${explorerUrl(chainId || undefined)}/address/${eligibilityModule}`} decoration>
              {formatAddress(eligibilityModule)}
            </ChakraNextLink>
          ),
        },
      ]),
    [eligibilityModule, chainId],
  );

  if (!chainId) return null;

  return (
    <div className='mx-auto flex w-1/2 flex-col'>
      <DevInfo devInfos={devInfo} />

      <div className='flex flex-col gap-2'>
        <h3 className='font-bold'>Eligibility Rules</h3>

        {map(flatten(eligibilityRules), (rule) => (
          <div key={rule.address}>
            {rule.module.name} (
            <ChakraNextLink href={`${explorerUrl(chainId)}/address/${rule.address}`} isExternal decoration>
              {formatAddress(rule.address)}
            </ChakraNextLink>
            )
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouncilsDevInfo;
