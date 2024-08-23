'use client';

import { Button, Text } from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import { useWearersEligibilityStatus } from 'hats-hooks';
import { get, includes, toLower } from 'lodash';
import { AllowlistModal } from 'modules-ui';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS } from '../utils';
import EligibilityRule from './EligibilityRule';

const AllowlistEligibility = ({
  chainId,
  wearer,
  selectedHat,
  moduleDetails,
  moduleParameters,
}: ModuleDetailsHandler) => {
  // TODO subgraph will need to index these allowlists specifically, to show the actual lists

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

        <EligibilityRule
          rule={
            <Text>
              Be on the{' '}
              <Button
                onClick={() => setModals?.({ allowlistManager: true })}
                variant='text'
                textDecoration='underline'
              >
                Allowlist
              </Button>
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

      <EligibilityRule
        rule={
          <Text>
            Be on the{' '}
            <Button
              onClick={() => setModals?.({ allowlistManager: true })}
              variant='text'
              textDecoration='underline'
            >
              Allowlist
            </Button>
          </Text>
        }
        status={ELIGIBILITY_STATUS.ineligible}
        displayStatus='Not allowed'
        icon={BsFillXOctagonFill} // {EmptyWearer}
      />
    </>
  );
};

export default AllowlistEligibility;
