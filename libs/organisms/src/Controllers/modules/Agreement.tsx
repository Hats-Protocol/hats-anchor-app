'use client';

import { Button, Text } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useOverlay } from 'contexts';
import { useWearersEligibilityStatus } from 'hats-hooks';
import { get, includes, toLower } from 'lodash';
import { AgreementModal } from 'modules-ui';
import posthog from 'posthog-js';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { ChakraNextLink } from 'ui';
import { ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS } from '../utils';
import EligibilityRule from './EligibilityRule';

const AgreementEligibility = ({
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
  selectedHat,
}: ModuleDetailsHandler) => {
  const hatId = get(selectedHat, 'id', '0');
  const { setModals } = useOverlay();

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

  const eligibilityModalFlag =
    posthog.isFeatureEnabled('eligibility-modal') ||
    process.env.NODE_ENV === 'development';

  if (!moduleDetails?.id) return null;

  return (
    <>
      <AgreementModal
        eligibilityHatId={selectedHat?.id}
        moduleInfo={{
          ...moduleDetails,
          liveParameters: moduleParameters,
        }}
      />

      <EligibilityRule
        rule={
          <Text>
            Sign the{' '}
            {eligibilityModalFlag ? (
              <Button
                onClick={() => setModals?.({ agreementManager: true })}
                variant='link'
              >
                Agreement
              </Button>
            ) : (
              <ChakraNextLink
                href={`${CONFIG.CLAIMS_URL}/${chainId}/${hatIdDecimalToIp(
                  BigInt(hatId),
                )}`}
                isExternal
                decoration
              >
                Agreement
              </ChakraNextLink>
            )}
          </Text>
        }
        status={
          isEligible
            ? ELIGIBILITY_STATUS.eligible
            : ELIGIBILITY_STATUS.ineligible
        }
        displayStatus={isEligible ? 'Signed' : 'Not Signed'}
        icon={isEligible ? BsCheckSquareFill : BsFillXOctagonFill}
      />
    </>
  );
};

export default AgreementEligibility;
