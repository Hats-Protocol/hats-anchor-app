'use client';

import { CONFIG } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useWearersEligibilityStatus } from 'hats-hooks';
import _, { get, includes, toLower } from 'lodash';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { ChakraNextLink } from 'ui';
import { ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS } from '../utils';
import EligibilityRule from './EligibilityRule';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

const ElectionEligibility = ({
  moduleDetails,
  chainId,
  wearer,
  selectedHat,
}: ModuleDetailsHandler) => {
  const wearerIds = wearer ? [toLower(wearer) as Hex] : [];
  const { data: wearerStatus } = useWearersEligibilityStatus({
    selectedHat,
    wearerIds,
    chainId: chainId as SupportedChains,
  });
  const isEligible = includes(
    get(wearerStatus, 'eligibleWearers'),
    toLower(wearer),
  );
  const hatId = _.get(selectedHat, 'id', '0');

  return (
    <EligibilityRule
      rule={
        <ChakraNextLink
          href={`${CONFIG.CLAIMS_URL}/${chainId}/${hatIdDecimalToIp(
            BigInt(hatId),
          )}`}
          decoration
          fontSize={{ base: 'sm', md: 'md' }}
        >
          Be elected by voters
        </ChakraNextLink>
      }
      status={
        isEligible ? ELIGIBILITY_STATUS.eligible : ELIGIBILITY_STATUS.ineligible
      }
      displayStatus={isEligible ? 'Elected' : 'Not Elected'}
      icon={isEligible ? BsCheckSquareFill : RemovedWearer}
    />
  );
};

export default ElectionEligibility;
