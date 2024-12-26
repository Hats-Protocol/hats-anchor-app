'use client';

import { Button, Text } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { Module } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useOverlay } from 'contexts';
import { useMediaStyles } from 'hooks';
import { flatten, get, size } from 'lodash';
import { useCurrentEligibility } from 'modules-hooks';
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

import { EligibilityRuleDetails } from '../eligibility-rules/eligibility-rule-details';
import { ELIGIBILITY_STATUS } from '../eligibility-rules/utils';
import { AgreementContentModal } from './agreement-content-modal';
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
  isReadyToClaim: aggregateIsReadyToClaim,
  setIsReadyToClaim,
  ruleSets,
}: ModuleDetailsHandler) => {
  const hatId = get(selectedHat, 'id', '0');
  const { setModals } = useOverlay();
  const { isMobile } = useMediaStyles();

  const { data: currentEligibility } = useCurrentEligibility({
    chainId: chainId as SupportedChains,
    selectedHat,
    wearerAddress: wearer,
    eligibilityRules: moduleDetails
      ? [
          [
            {
              module: moduleDetails as Module,
              address: moduleDetails.instanceAddress as Hex,
              liveParams: moduleParameters,
            },
          ],
        ]
      : undefined,
  });

  const onlyModule = size(flatten(ruleSets)) === 1;
  const moduleEligibility = get(
    currentEligibility,
    moduleDetails?.instanceAddress as Hex,
  );
  const isEligible =
    get(moduleEligibility, 'eligible', false) &&
    get(moduleEligibility, 'goodStanding', false);
  const isReadyToClaim =
    !!moduleDetails?.instanceAddress &&
    get(aggregateIsReadyToClaim, moduleDetails.instanceAddress, false);

  let modalName = `${moduleDetails?.instanceAddress}-${MODAL_NAME}`;
  if (modalSuffix) {
    modalName += modalSuffix;
  }

  const eligibilityModalFlag =
    posthog.isFeatureEnabled('eligibility-modal') ||
    process.env.NODE_ENV === 'development';

  if (!moduleDetails?.instanceAddress) return null;

  // set the eligibility rule text based on current feature flag & app
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
            if (!moduleDetails.instanceAddress) return;

            if (onlyModule) {
              // TODO or last module
              setIsReadyToClaim?.(moduleDetails.instanceAddress);
            }
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
      {!IS_CLAIMS_APP && (
        <AgreementModal
          eligibilityHatId={selectedHat?.id}
          moduleInfo={moduleDetails}
        />
      )}
      {IS_CLAIMS_APP && (
        <AgreementContentModal
          moduleDetails={moduleDetails}
          chainId={chainId as SupportedChains}
          onlyModule={onlyModule}
        />
      )}

      <EligibilityRuleDetails
        rule={rule}
        status={status}
        displayStatus={displayStatus}
        icon={icon}
      />
    </>
  );
};
