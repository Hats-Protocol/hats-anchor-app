/* eslint-disable import/prefer-default-export */
import { Text } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill } from 'react-icons/bs';
import { AppHat } from 'types';
import { fetchDetailsIpfs, fetchHatDetails, fetchWearerDetails } from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../general';

const ChakraNextLink = dynamic(() =>
  import('ui').then((i) => i.ChakraNextLink),
);
const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

export const handleHatWearingEligibility = async ({
  moduleParameters,
  wearer,
  chainId,
}: {
  moduleParameters: ModuleParameter[];
  wearer: Hex | undefined;
  chainId: number;
}): Promise<EligibilityRuleDetails> => {
  const hatParam = moduleParameters.find((p) => p.displayType === 'hat');

  const hatDetails = await fetchHatDetails(hatParam?.value as Hex, chainId);
  const hatIpfsDetails = await fetchDetailsIpfs(hatDetails?.details);
  const hatName = _.get(
    hatIpfsDetails,
    'data.data.name', // data object is nested in data param from fetch result
    _.get(hatDetails, 'details'),
  );

  let isWearing: boolean = false;
  if (wearer) {
    const wearerHats = await fetchWearerDetails(wearer, chainId);
    isWearing = _.some(wearerHats, (hat: AppHat) => hat.id === hatParam?.value);
  }

  if (isWearing) {
    return {
      rule: (
        <Text>
          Wear the {hatName} Hat (
          <ChakraNextLink href='/'>
            ID: {hatIdDecimalToIp(BigInt(hatDetails.id))}
          </ChakraNextLink>
          )
        </Text>
      ),
      status: ELIGIBILITY_STATUS.eligible,
      displayStatus: 'Wearer',
      icon: BsCheckSquareFill,
    };
  }

  return {
    rule: (
      <Text noOfLines={1}>
        Wear the {hatName} Hat (
        <ChakraNextLink href='/'>
          ID: {hatIdDecimalToIp(BigInt(hatDetails.id))}
        </ChakraNextLink>
        )
      </Text>
    ),
    status: ELIGIBILITY_STATUS.ineligible,
    displayStatus: 'Not Wearer',
    icon: RemovedWearer,
  };
};
