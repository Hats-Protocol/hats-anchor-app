'use client';

import { useOverlay } from 'contexts';
import { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { Button, cn, Link, Skeleton } from 'ui';
import { useAccount } from 'wagmi';

import { ELIGIBILITY_STATUS, EligibilityRuleDetailsProps, TOGGLE_STATUS } from './utils';

const IS_CLAIMS_APP = process.env.NEXT_PUBLIC_CLAIMS_APP === 'true';

const EligibilityRuleWrapper = ({ rule, children }: { rule: ReactNode; children: ReactNode }) => {
  if (!rule) {
    return <Skeleton className='mx-4 my-2' />;
  }

  return (
    <div className='my-2 flex justify-between'>
      {rule}

      {children}
    </div>
  );
};

export const EligibilityRuleDetails = ({
  rule,
  status,
  displayStatus,
  displayStatusLink,
  icon,
  isReadyToClaim,
}: EligibilityRuleDetailsProps) => {
  const { setModals } = useOverlay();
  const { address } = useAccount();

  let statusColor = 'text-destructive';
  if (status === ELIGIBILITY_STATUS.expiring) {
    statusColor = 'text-orange-500';
  } else if (
    status === ELIGIBILITY_STATUS.eligible ||
    status === ELIGIBILITY_STATUS.pending ||
    status === TOGGLE_STATUS.active
  ) {
    statusColor = 'text-functional-success';
  }

  // TODO handle tooltip on displayStatus
  const Icon = icon as IconType;

  if (displayStatusLink) {
    return (
      <EligibilityRuleWrapper rule={rule}>
        <Link href={displayStatusLink}>
          <div className='flex items-center gap-1'>
            <p>{displayStatus}</p>

            <Icon className='h-[14px] w-[14px] md:h-4 md:w-4' />
          </div>
        </Link>
      </EligibilityRuleWrapper>
    );
  }

  if (address) {
    return (
      <EligibilityRuleWrapper rule={rule}>
        <div className={cn('flex items-center gap-1', statusColor)}>
          <p>{displayStatus}</p>

          <Icon className='h-[14px] w-[14px] md:h-4 md:w-4' />
        </div>
      </EligibilityRuleWrapper>
    );
  }

  if (IS_CLAIMS_APP) {
    return (
      <EligibilityRuleWrapper rule={rule}>
        <div className={cn('flex items-center gap-1', statusColor)}>
          <p>{displayStatus}</p>

          <Icon className='h-[14px] w-[14px] md:h-4 md:w-4' />
        </div>
      </EligibilityRuleWrapper>
    );
  }

  return (
    <EligibilityRuleWrapper rule={rule}>
      <Button
        className='text-functional-link-primary font-medium'
        variant='link'
        onClick={() => setModals?.({ checkEligibility: true })}
      >
        Check Eligibility
      </Button>
    </EligibilityRuleWrapper>
  );
};
