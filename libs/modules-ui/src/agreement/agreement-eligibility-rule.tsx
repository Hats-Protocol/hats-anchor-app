'use client';

import { CONFIG } from '@hatsprotocol/config';
import { Module } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useOverlay } from 'contexts';
import { useMediaStyles } from 'hooks';
import { flatten, get, size } from 'lodash';
import { useCurrentEligibility } from 'modules-hooks';
import posthog from 'posthog-js';
import { BsCheckSquare, BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { Button, Link } from 'ui';
import { ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { EligibilityRuleDetails } from '../eligibility-rules/eligibility-rule-details';
import { ELIGIBILITY_STATUS } from '../eligibility-rules/utils';
import { AgreementContentModal } from './agreement-content-modal';
import { AgreementModal } from './agreement-modal';

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

  // TODO or last module in chain
  const onlyModule = size(flatten(ruleSets)) === 1;
  const moduleEligibility = get(currentEligibility, moduleDetails?.instanceAddress as Hex);
  const isEligible = get(moduleEligibility, 'eligible', false) && get(moduleEligibility, 'goodStanding', false);
  const isReadyToClaim =
    !!moduleDetails?.instanceAddress && get(aggregateIsReadyToClaim, moduleDetails.instanceAddress, false);

  let modalName = `${moduleDetails?.instanceAddress}-${MODAL_NAME}`;
  if (modalSuffix) {
    modalName += modalSuffix;
  }

  const eligibilityModalFlag = posthog.isFeatureEnabled('eligibility-modal') || process.env.NODE_ENV !== 'production';

  if (!moduleDetails?.instanceAddress) return null;

  // set the eligibility rule text based on current feature flag & app
  let rule = (
    <p>
      Sign the{' '}
      <Link
        href={`${CONFIG.CLAIMS_URL}/${chainId}/${hatIdDecimalToIp(BigInt(hatId))}`}
        className='underline'
        isExternal
      >
        Agreement
      </Link>
    </p>
  );
  if ((eligibilityModalFlag && !IS_CLAIMS_APP) || (IS_CLAIMS_APP && isMobile)) {
    rule = (
      <div>
        Sign the{' '}
        <Button
          onClick={() => {
            if (!moduleDetails.instanceAddress) return;

            if (onlyModule) {
              setIsReadyToClaim?.(moduleDetails.instanceAddress);
            }
            setModals?.({ [modalName]: true });
          }}
          variant='link'
          className='text-base underline'
        >
          Agreement
        </Button>
      </div>
    );
  }
  if (IS_CLAIMS_APP && !isMobile) {
    rule = <p>Sign the Agreement</p>;
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
      {!IS_CLAIMS_APP && <AgreementModal eligibilityHatId={selectedHat?.id} moduleInfo={moduleDetails} />}
      {IS_CLAIMS_APP && (
        <AgreementContentModal
          selectedHat={selectedHat}
          moduleDetails={moduleDetails}
          chainId={chainId as SupportedChains}
          onlyModule={onlyModule}
          currentEligibility={currentEligibility || undefined}
        />
      )}

      <EligibilityRuleDetails rule={rule} status={status} displayStatus={displayStatus} icon={icon} />
    </>
  );
};
