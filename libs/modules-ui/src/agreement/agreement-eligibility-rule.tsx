'use client';

import { Button, Text } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useOverlay } from 'contexts';
import { useWearersEligibilityStatus } from 'hats-hooks';
import { useMediaStyles } from 'hooks';
import { get, includes, toLower } from 'lodash';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import {
  BsCheckSquare,
  BsCheckSquareFill,
  BsFillXOctagonFill,
} from 'react-icons/bs';
import { SupportedChains } from 'types';
import { ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import {
  ELIGIBILITY_STATUS,
  EligibilityRuleDetails,
} from '../eligibility-rules';
import { AgreementModal } from './agreement-modal';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

const MODAL_NAME = 'agreementManager';
const IS_CLAIMS_APP = process.env.NEXT_PUBLIC_CLAIMS_APP === 'true';

export const AgreementEligibilityRule = ({
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
  selectedHat,
  modalSuffix,
  isReadyToClaim,
  setIsReadyToClaim,
}: ModuleDetailsHandler) => {
  const hatId = get(selectedHat, 'id', '0');
  const { setModals } = useOverlay();
  const { isMobile } = useMediaStyles();

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

  let modalName = MODAL_NAME;
  if (modalSuffix) {
    modalName += modalSuffix;
  }

  const eligibilityModalFlag =
    posthog.isFeatureEnabled('eligibility-modal') ||
    process.env.NODE_ENV === 'development';

  if (!moduleDetails?.id) return null;

  let rule = (
    <Text>
      Sign the{' '}
      <ChakraNextLink
        href={`${CONFIG.CLAIMS_URL}/${chainId}/${hatIdDecimalToIp(
          BigInt(hatId),
        )}`}
        isExternal
        decoration
      >
        Agreement
      </ChakraNextLink>
    </Text>
  );
  if ((eligibilityModalFlag && !IS_CLAIMS_APP) || (IS_CLAIMS_APP && isMobile)) {
    rule = (
      <Text>
        Sign the{' '}
        <Button
          onClick={() => {
            setIsReadyToClaim?.(true);
            setModals?.({ [modalName]: true });
          }}
          variant='link'
        >
          Agreement
        </Button>
      </Text>
    );
  }
  if (IS_CLAIMS_APP && !isMobile) {
    rule = <Text>Sign the Agreement</Text>;
  }

  let displayStatus = 'Not Signed';
  let status = ELIGIBILITY_STATUS.ineligible;
  let icon = BsFillXOctagonFill;
  if (isReadyToClaim) {
    displayStatus = 'Pending';
    status = ELIGIBILITY_STATUS.pending;
    icon = BsCheckSquare;
  }
  if (isEligible) {
    status = ELIGIBILITY_STATUS.eligible;
    displayStatus = 'Signed';
    icon = BsCheckSquareFill;
  }

  return (
    <>
      <AgreementModal
        eligibilityHatId={selectedHat?.id}
        moduleInfo={{
          ...moduleDetails,
          liveParameters: moduleParameters,
        }}
      />

      <EligibilityRuleDetails
        rule={rule}
        status={status}
        displayStatus={displayStatus}
        icon={icon}
      />
    </>
  );
};
