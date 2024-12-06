'use client';

import { Button, Text } from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import { useWearersEligibilityStatus } from 'hats-hooks';
import { filter, get, includes, map, toLower } from 'lodash';
import { useAllowlist } from 'modules-hooks';
import posthog from 'posthog-js';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import {
  ELIGIBILITY_STATUS,
  EligibilityRuleDetails,
} from '../eligibility-rules';
import { AllowlistModal } from './allowlist-modal';

export const AllowlistEligibilityRule = ({
  chainId,
  wearer,
  selectedHat,
  moduleDetails,
  moduleParameters,
}: ModuleDetailsHandler) => {
  const { setModals } = useOverlay();
  const wearerIds = wearer ? [toLower(wearer) as Hex] : [];
  const { data: wearerStatus } = useWearersEligibilityStatus({
    selectedHat,
    wearerIds,
    chainId: chainId as SupportedChains,
  });

  const { data: allowlist } = useAllowlist({
    id: moduleDetails?.id,
    chainId: chainId as SupportedChains,
  });
  const isIncludedInAllowlist = includes(
    map(
      filter(allowlist, (a) => a.eligible && !a.badStanding),
      'address',
    ),
    toLower(wearer),
  );
  const isEligible =
    includes(get(wearerStatus, 'eligibleWearers'), toLower(wearer)) ||
    isIncludedInAllowlist;

  const eligibilityModalFlag =
    posthog.isFeatureEnabled('eligibility-modal') ||
    process.env.NODE_ENV === 'development';

  if (!selectedHat || !moduleDetails?.id) return null;

  if (isEligible) {
    return (
      <>
        <AllowlistModal
          eligibilityHatId={selectedHat?.id}
          moduleInfo={{
            ...moduleDetails,
            liveParameters: moduleParameters,
          }}
        />

        <EligibilityRuleDetails
          rule={
            <Text>
              Be on the{' '}
              {eligibilityModalFlag ? (
                <Button
                  onClick={() =>
                    setModals?.({
                      [`${moduleDetails.id}-allowlistManager`]: true,
                    })
                  }
                  variant='link'
                >
                  Allowlist
                </Button>
              ) : (
                'Allowlist'
              )}
            </Text>
          }
          status={ELIGIBILITY_STATUS.eligible}
          displayStatus='Allowed'
          icon={BsCheckSquareFill}
        />
      </>
    );
  }

  return (
    <>
      <AllowlistModal
        eligibilityHatId={selectedHat?.id}
        moduleInfo={{
          ...moduleDetails,
          liveParameters: moduleParameters,
        }}
      />

      <EligibilityRuleDetails
        rule={
          <Text>
            Be on the{' '}
            {eligibilityModalFlag ? (
              <Button
                onClick={() =>
                  setModals?.({
                    [`${moduleDetails.id}-allowlistManager`]: true,
                  })
                }
                variant='link'
                textDecoration='underline'
              >
                Allowlist
              </Button>
            ) : (
              'Allowlist'
            )}
          </Text>
        }
        status={ELIGIBILITY_STATUS.ineligible}
        displayStatus='Not allowed'
        icon={BsFillXOctagonFill} // {EmptyWearer}
      />
    </>
  );
};
