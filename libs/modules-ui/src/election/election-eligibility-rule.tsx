'use client';

import { Button, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { CONFIG } from '@hatsprotocol/config';
import { useOverlay } from 'contexts';
import { useWearersEligibilityStatus } from 'hats-hooks';
import { useMediaStyles } from 'hooks';
import { get, includes, toLower } from 'lodash';
import posthog from 'posthog-js';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { Link } from 'ui';
import { ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../eligibility-rules';
import { ElectionModal } from './election-modal';

const IS_CLAIMS_APP = process.env.NEXT_PUBLIC_CLAIMS_APP === 'true';

export const ElectionEligibilityRule = ({
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
  selectedHat,
  modalSuffix,
}: ModuleDetailsHandler) => {
  const { setModals } = useOverlay();
  const wearerIds = wearer ? [toLower(wearer) as Hex] : [];
  const { data: wearerStatus } = useWearersEligibilityStatus({
    selectedHat,
    wearerIds,
    chainId: chainId as SupportedChains,
  });
  const { isMobile } = useMediaStyles();
  const isEligible = includes(get(wearerStatus, 'eligibleWearers'), toLower(wearer));
  const hatId = get(selectedHat, 'id', '0');

  const eligibilityModalFlag = posthog.isFeatureEnabled('eligibility-modal') || process.env.NODE_ENV === 'development';

  let modalName = 'electionManager';
  if (modalSuffix) {
    modalName = `electionManager${modalSuffix}`;
  }

  if (!moduleDetails) return null;
  // TODO handle modal in claims app

  let rule = (
    <Link href={`${CONFIG.CLAIMS_URL}/${chainId}/${hatIdDecimalToIp(BigInt(hatId))}`} className='underline'>
      Be elected by voters
    </Link>
  );
  if (IS_CLAIMS_APP) {
    if (isMobile) {
      rule = (
        <Button
          onClick={() => {
            setModals?.({ [modalName]: true });
          }}
          variant='link'
        >
          Be elected by voters
        </Button>
      );
    } else {
      rule = <Text>Be elected by voters</Text>;
    }
  }
  if (!IS_CLAIMS_APP && eligibilityModalFlag) {
    // TODO combine with above after feature release
    rule = (
      <Button
        onClick={() => {
          setModals?.({ [modalName]: true });
        }}
        variant='link'
      >
        Be elected by voters
      </Button>
    );
  }

  return (
    <>
      <ElectionModal
        eligibilityHatId={selectedHat?.id}
        moduleInfo={{ ...moduleDetails, liveParameters: moduleParameters }}
      />

      <EligibilityRuleDetails
        rule={rule}
        status={isEligible ? ELIGIBILITY_STATUS.eligible : ELIGIBILITY_STATUS.ineligible}
        displayStatus={isEligible ? 'Elected' : 'Not Elected'}
        icon={isEligible ? BsCheckSquareFill : BsFillXOctagonFill}
      />
    </>
  );
};
