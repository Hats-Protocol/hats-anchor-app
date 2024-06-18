'use client';

/* eslint-disable import/prefer-default-export */
import { Text } from '@chakra-ui/react';
import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { AppHat } from 'types';
import {
  fetchDetailsIpfs,
  fetchHatDetails,
  fetchWearerDetails,
  hatLink,
  ModuleDetailsHandler,
} from 'utils';
import { Hex } from 'viem';

import { ChakraNextLink } from '../../../../atoms';
import {
  DEFAULT_ELIGIBILITY_DETAILS,
  ELIGIBILITY_STATUS,
  EligibilityRuleDetails,
} from '../general';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);
const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));

export const handleHatWearingEligibility = async ({
  moduleParameters,
  wearer,
  chainId,
}: ModuleDetailsHandler): Promise<EligibilityRuleDetails> => {
  const hatParam = _.find(moduleParameters, { displayType: 'hat' });
  const hatDetails = await fetchHatDetails(hatParam?.value as Hex, chainId);
  const hatIpfsDetails = await fetchDetailsIpfs(hatDetails?.details);
  const hatName = _.get(
    hatIpfsDetails,
    'data.data.name', // data object is nested in data param from fetch result
    _.get(hatDetails, 'details'),
  );

  let isWearing = false;
  if (wearer) {
    const wearerHats = await fetchWearerDetails(wearer, chainId);
    isWearing = _.some(_.get(wearerHats, 'currentHats'), (hat: AppHat) =>
      _.eq(hat.id, hatIdDecimalToHex(hatParam?.value as bigint)),
    );
  }

  if (!hatDetails) {
    if (!wearer || !chainId) {
      return DEFAULT_ELIGIBILITY_DETAILS({});
    }

    return DEFAULT_ELIGIBILITY_DETAILS({ wearer, chainId });
  }

  if (isWearing) {
    return {
      rule: (
        <Text size={{ base: 'sm', md: 'md' }}>
          Wear the {hatName} Hat (
          <ChakraNextLink
            href={hatLink({ chainId, hatId: hatDetails.id })}
            decoration
          >
            ID: {hatIdDecimalToIp(BigInt(hatDetails.id))}
          </ChakraNextLink>
          )
        </Text>
      ),
      status: ELIGIBILITY_STATUS.eligible,
      displayStatus: 'Wearer',
      icon: WearerIcon,
    };
  }

  return {
    rule: (
      <Text noOfLines={1} size={{ base: 'sm', md: 'md' }}>
        Wear the {hatName} Hat (
        <ChakraNextLink
          href={hatLink({ chainId, hatId: hatDetails.id })}
          decoration
        >
          ID: {hatIdDecimalToIp(BigInt(hatDetails.id))}
        </ChakraNextLink>
        )
      </Text>
    ),
    status: ELIGIBILITY_STATUS.ineligible,
    displayStatus: 'Not Wearing',
    icon: RemovedWearer,
  };
};
