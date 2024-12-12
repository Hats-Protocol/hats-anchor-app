'use client';

import { useCouncilDetails } from 'hooks';
import { compact, get } from 'lodash';
import { useMemo } from 'react';
import { ChakraNextLink, DevInfo } from 'ui';
import { formatAddress } from 'utils';
import { explorerUrl, parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

const CouncilsDevInfo = ({ slug }: { slug: string }) => {
  const { chainId, address } = parseCouncilSlug(slug);

  const { data: councilDetails, isLoading: councilDetailsLoading } =
    useCouncilDetails({
      chainId: chainId ?? 11155111,
      address,
    });
  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const eligibilityModule = get(primarySignerHat, 'eligibility') as
    | Hex
    | undefined;
  console.log(primarySignerHat, eligibilityModule);

  // TODO easy way to get MCH details?

  const devInfo = useMemo(
    () =>
      compact([
        eligibilityModule && {
          label: 'Eligibility',
          descriptor: (
            <ChakraNextLink
              href={`${explorerUrl(chainId || undefined)}/address/${eligibilityModule}`}
            >
              {formatAddress(eligibilityModule)}
            </ChakraNextLink>
          ),
        },
      ]),
    [eligibilityModule, chainId],
  );

  return <DevInfo devInfos={devInfo} />;
};

export default CouncilsDevInfo;
