'use client';

import { useOverlay } from 'contexts';
import { useWearersEligibilityStatus } from 'hats-hooks';
import { useMediaStyles } from 'hooks';
import { get, includes, toLower } from 'lodash';
import { useLockFromHat } from 'modules-hooks';
import { BsCheckSquare, BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { Button, Link } from 'ui';
import { claimsLink, ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../eligibility-rules';
import { SubscriptionClaimsModal } from './subscription-claims';

const IS_CLAIMS_APP = process.env.NEXT_PUBLIC_CLAIMS_APP === 'true';
const SUBSCRIPTION_MODAL_NAME = 'subscriptionManager';
const MIN_ONE_TIME_DURATION = 9 * 365; // 9 years, duration is in days

// TODO get expiration date from key

export const UnlockEligibilityRule = ({
  selectedHat,
  moduleDetails,
  moduleParameters,
  chainId,
  wearer,
  modalSuffix,
  isReadyToClaim: aggregateIsReadyToClaim,
}: ModuleDetailsHandler) => {
  const { setModals } = useOverlay();
  const { isMobile } = useMediaStyles();

  const {
    allowance: tokenAllowance,
    duration,
    keyPrice,
  } = useLockFromHat({
    moduleParameters,
    chainId,
  });

  const isOneTime = duration && duration >= MIN_ONE_TIME_DURATION;
  const hasAllowance = !!tokenAllowance && !!keyPrice && tokenAllowance >= keyPrice;
  const isReadyToClaim =
    isOneTime &&
    hasAllowance &&
    moduleDetails?.instanceAddress &&
    get(aggregateIsReadyToClaim, moduleDetails.instanceAddress);

  const wearerIds = wearer ? [toLower(wearer) as Hex] : [];
  const { data: wearerStatus } = useWearersEligibilityStatus({
    selectedHat,
    wearerIds,
    chainId: chainId as SupportedChains,
  });
  const isEligible = includes(get(wearerStatus, 'eligibleWearers'), toLower(wearer));
  const renewSoon = isEligible && !hasAllowance;

  let modalName = SUBSCRIPTION_MODAL_NAME;
  if (modalSuffix) {
    modalName = `${SUBSCRIPTION_MODAL_NAME}${modalSuffix}`;
  }

  let claimsAppRule = <p>Pay the {isOneTime ? 'fee' : 'subscription'}</p>;
  let status = ELIGIBILITY_STATUS.ineligible;
  let displayStatus = 'Not Paid';
  let icon = BsFillXOctagonFill;
  if (isMobile) {
    claimsAppRule = (
      <span>
        Pay the{' '}
        <Button
          variant='link'
          onClick={() => {
            setModals?.({
              [`${moduleDetails?.instanceAddress}-${modalName}`]: true,
            });
          }}
          className='text-base'
        >
          {isOneTime ? 'Fee' : 'Subscription'}
        </Button>
      </span>
    );
  }
  if (isReadyToClaim || hasAllowance) {
    status = ELIGIBILITY_STATUS.pending;
    displayStatus = 'Pending';
    icon = BsCheckSquare;
  }
  if (isEligible) {
    if (renewSoon && !isOneTime) {
      status = ELIGIBILITY_STATUS.expiring;
      displayStatus = 'Renew Soon';
      icon = BsCheckSquare;
    } else {
      status = ELIGIBILITY_STATUS.eligible;
      displayStatus = 'Paid';
      icon = BsCheckSquareFill;
    }
  }

  if (!moduleDetails) {
    return null;
  }

  if (IS_CLAIMS_APP) {
    return (
      <>
        <SubscriptionClaimsModal moduleDetails={moduleDetails} moduleParameters={moduleParameters} />

        <EligibilityRuleDetails rule={claimsAppRule} status={status} displayStatus={displayStatus} icon={icon} />
      </>
    );
  }

  return (
    <EligibilityRuleDetails
      rule={
        <p>
          Pay the{' '}
          <Link href={claimsLink({ chainId, hatId: selectedHat?.id })} className='gray.50 text-base'>
            {isOneTime ? 'Fee' : 'Subscription'}
          </Link>
        </p>
      }
      status={status}
      displayStatus={displayStatus}
      // statusTooltip={
      //   status === ELIGIBILITY_STATUS.expiring
      //     ? `Expires ${formatDate(moduleParameters.expiration)}`
      //     : ''
      // }
      icon={icon}
    />
  );
};
