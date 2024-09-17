'use client';

import { Text } from '@chakra-ui/react';
import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails, useWearerDetails } from 'hats-hooks';
import { find, get, includes, map } from 'lodash';
import dynamic from 'next/dynamic';
import { BsFillXOctagonFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { ChakraNextLink } from 'ui';
import { hatLink, ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS } from '../utils';
import EligibilityRule from './EligibilityRule';

const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));

const HatWearingEligibility = ({
  moduleParameters,
  wearer,
  chainId,
}: ModuleDetailsHandler) => {
  const hatParam = find(moduleParameters, { displayType: 'hat' });

  const localHatId =
    hatParam?.value && hatIdDecimalToHex(hatParam.value as bigint);
  const { details: hatDetails, data: mainDetails } = useHatDetails({
    hatId: localHatId as Hex,
    chainId: chainId as SupportedChains,
  });
  const { data: wearerDetails } = useWearerDetails({
    wearerAddress: wearer,
    chainId,
  });

  const isWearing = includes(map(wearerDetails, 'id'), localHatId);
  const ipId = mainDetails && hatIdDecimalToIp(BigInt(mainDetails.id));
  const hatName = get(hatDetails, 'name', get(mainDetails, 'details'));

  if (isWearing) {
    return (
      <EligibilityRule
        rule={
          <Text>
            Wear the {hatName} Hat (
            <ChakraNextLink
              href={hatLink({ chainId, hatId: mainDetails?.id })}
              decoration
            >
              ID: {ipId}
            </ChakraNextLink>
            )
          </Text>
        }
        status={ELIGIBILITY_STATUS.eligible}
        displayStatus='Wearer'
        icon={WearerIcon}
      />
    );
  }

  return (
    <EligibilityRule
      rule={
        <Text noOfLines={1}>
          Wear the {hatName} Hat (
          <ChakraNextLink
            href={hatLink({ chainId, hatId: mainDetails?.id })}
            decoration
          >
            ID: {ipId}
          </ChakraNextLink>
          )
        </Text>
      }
      status={ELIGIBILITY_STATUS.ineligible}
      displayStatus='Not Wearing'
      icon={BsFillXOctagonFill}
    />
  );
};

export default HatWearingEligibility;
