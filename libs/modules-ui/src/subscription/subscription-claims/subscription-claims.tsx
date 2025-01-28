'use client';

import { useEligibility } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { some } from 'lodash';
import { useLockFromHat } from 'modules-hooks';
import { BsCheckSquare, BsCheckSquareFill, BsXOctagonFill } from 'react-icons/bs';
import { MixedIcon } from 'types';
import { Card } from 'ui';
import { Skeleton } from 'ui';
import { eligibilityRuleToModuleDetails, getDuration } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { AllowanceActions } from './allowance-actions';
import { SubscriptionDevInfo } from './subscription-dev-info';

const MIN_ONE_TIME_DURATION = 9 * 365; // 9 years, duration is in days

export const SubscriptionClaims = () => {
  const { address } = useAccount();
  const { chainId, activeRule, selectedHat } = useEligibility();
  const moduleDetails = eligibilityRuleToModuleDetails(activeRule);
  const { isLoading, price, keyPrice, symbol, duration, keyBalance, allowance } = useLockFromHat({
    moduleParameters: moduleDetails?.liveParameters,
    chainId,
  });

  const { data: wearerDetails, isLoading: isLoadingWearerDetails } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });

  const isWearing = some(wearerDetails, { id: selectedHat?.id });
  const hasAllowance = allowance && allowance >= BigInt(0);
  const activeSubscription = keyBalance && keyBalance > BigInt(0);

  if (isLoading || isLoadingWearerDetails) {
    return <Skeleton className='h-[500px] w-full rounded-md' />;
  }

  if (!moduleDetails) {
    return (
      <Card className='p-4'>
        <h2 className='text-lg font-medium'>Subscribe</h2>

        <p>Can't install instance params</p>
      </Card>
    );
  }

  const isOneTime = duration && duration >= MIN_ONE_TIME_DURATION;
  const durationText = getDuration(duration);

  let status = 'Not Paid';
  let icon: MixedIcon = BsXOctagonFill;
  let color = 'red.500';
  if (hasAllowance && !activeSubscription) {
    const durationsLeft = keyPrice ? Number(allowance / keyPrice) : 1;
    status = isOneTime
      ? 'Authorized'
      : `Authorized for ${durationsLeft} ${durationText.noun}${durationsLeft > 1 || durationsLeft === 0 ? 's' : ''}`;
    icon = BsCheckSquare;
    color = 'green.500';
  } else if (activeSubscription) {
    const durationsLeft = keyPrice ? Number(allowance / keyPrice) : 1;
    if (durationsLeft === 0 && !isOneTime) {
      status = 'Renew Soon';
      icon = BsCheckSquare;
      color = 'orange.500';
    } else {
      status = isOneTime
        ? 'Paid'
        : `${durationsLeft} ${durationText.noun}${durationsLeft > 1 || durationsLeft === 0 ? 's' : ''} left`;
      icon = BsCheckSquareFill;
      color = 'green.500';
    }
  }

  const IconComponent = icon as any;

  return (
    <div className='space-y-8'>
      <Card className='w-full p-6'>
        <div className='space-y-8'>
          {isOneTime ? (
            <h3 className='text-lg font-medium'>Purchase and claim this Hat</h3>
          ) : (
            <h3 className='text-lg font-medium'>
              Authorize {durationText.adjective} fee {!activeSubscription ? `of ${price} ${symbol}` : ''} to claim this
              Hat
            </h3>
          )}

          <div className='space-y-1'>
            <h3 className='text-lg font-medium'>Requirements to claim and keep this Hat</h3>
            <div className='flex w-full justify-between'>
              <p>Pay the {isOneTime ? 'one-time fee' : 'subscription'}</p>

              <div className='flex items-center gap-2'>
                <p className='text-sm font-medium' style={{ color }}>
                  {status}
                </p>

                <IconComponent color={color} />
              </div>
            </div>
          </div>

          {(!hasAllowance || isWearing) && !isOneTime && (
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>
                {!isWearing
                  ? 'Authorize Unlock Protocol to withdraw from your wallet'
                  : 'How to pay the subscription fee'}
              </h3>

              <p>
                To enable a {durationText.adjective} withdrawal of the subscription fee, you pre-approved Unlock
                Protocol to withdraw {symbol} from the address that you use to claim the role.
              </p>
              <p>You can adjust the authorized amount to control the duration of your subscription.</p>
              <p>
                If the authorization runs out or the {durationText.adjective} fee is not covered in your wallet, you
                will lose your Hat and its privileges.
              </p>
            </div>
          )}
          {hasAllowance && !isWearing && !isOneTime && (
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Claim your Hat now</h3>

              <p>You've enabled a {durationText.adjective} withdrawal of the subscription fee.</p>
              <p>You can now claim this Hat and pay the first {durationText.noun}.</p>
              <p>
                Anytime you'd like, you can adjust the authorized amount to control the potential duration of your
                subscription.
              </p>
            </div>
          )}

          <AllowanceActions
            moduleDetails={moduleDetails}
            moduleParameters={moduleDetails?.liveParameters}
            activeSubscription={!!activeSubscription}
          />
        </div>
      </Card>

      <SubscriptionDevInfo moduleParameters={moduleDetails?.liveParameters} chainId={chainId} />
    </div>
  );
};
