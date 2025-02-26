'use client';

import { useEligibility } from 'contexts';
import { concat, first, flatten, get, map, pick } from 'lodash';
import { useSubscriptionClaim } from 'modules-hooks';
import posthog from 'posthog-js';
import { ReactNode } from 'react';
import React from 'react';
import { BsArrowRight, BsCheckSquare, BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { EligibilityRule, LabeledModules } from 'types';
import { cn } from 'ui';
import { Button } from 'ui';

const EligibilityStatus = ({
  isReadyToClaim,
  isEligible,
  customYesNo,
}: {
  isReadyToClaim: boolean | undefined;
  isEligible: boolean | undefined;
  customYesNo?: { yes: string; no: string };
}) => {
  const { yes, no } = pick(customYesNo, ['yes', 'no']);

  if (isEligible) {
    return (
      <div className='flex items-center gap-1'>
        <BsCheckSquareFill className='text-functional-success h-6 w-6' />

        <p className='text-functional-success'>{yes || 'Yes'}</p>
      </div>
    );
  }

  // TODO handle subscription allowance as Pending state
  if (isReadyToClaim) {
    return (
      <div className='flex items-center gap-1'>
        <BsCheckSquare className='text-functional-success h-6 w-6' />
        <p className='text-functional-success'>Pending</p>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-1'>
      <BsFillXOctagonFill className='text-destructive h-6 w-6' />

      <p className='text-destructive'>{no || 'No'}</p>
    </div>
  );
};

const getYesNoForRule = (rule: EligibilityRule, labeledModules: LabeledModules | undefined) => {
  if (rule.module.id.includes('allowlist')) {
    if (labeledModules?.selection === rule.address) {
      return { yes: 'Appointed', no: 'Not Selected' };
    }
    if (labeledModules?.criteria === rule.address) {
      return { yes: 'Compliant', no: 'Not Compliant' };
    }
  }
  if (rule.module.id.includes('public-lock-v14')) {
    return { yes: 'Paid', no: 'Not Paid' };
  }
  if (rule.module.id.includes('agreement')) {
    return { yes: 'Signed', no: 'Not Signed' };
  }

  return undefined;
};

const WrapperButton = ({ rule, customYesNo, labeledModules, children }: WrapperButtonProps) => {
  const { currentEligibility, activeRule, setActiveRule, isReadyToClaim, chainId } = useEligibility();
  const isEligible =
    get(currentEligibility, `[${rule.address}].eligible`) && get(currentEligibility, `[${rule.address}].goodStanding`);

  const yesNoForRule = getYesNoForRule(rule, labeledModules); // use yes/no from rule if available

  // TODO handle has key but 0 allowance
  const { hasAllowance } = useSubscriptionClaim({
    moduleDetails: rule.module,
    moduleParameters: rule.liveParams,
    chainId,
    setStatus: () => {},
    handlePendingTx: undefined, // only needed for purchasing/claiming
  });

  const handleClick = () => {
    setActiveRule(rule);
    posthog.capture('Viewed Module Requirements', {
      moduleId: rule.module.id,
      moduleAddress: rule.address,
      chainId,
    });
  };

  // TODO use an existing token value for the colors
  return (
    <div className='relative'>
      <Button
        variant='outline'
        onClick={handleClick}
        className={cn('block-size-auto h-auto w-auto min-w-[120px] justify-start whitespace-normal bg-white p-4', {
          'border-2 border-[#2D3748]': activeRule?.address === rule.address,
          'border border-[#2D3748]': activeRule?.address !== rule.address,
        })}
        key={rule.address}
      >
        <div className='flex flex-col gap-1'>
          <p className='text-left'>{children}</p>
          <EligibilityStatus
            isEligible={isEligible}
            isReadyToClaim={hasAllowance || get(isReadyToClaim, rule.address, false)}
            customYesNo={customYesNo || yesNoForRule}
          />
        </div>
      </Button>
      {activeRule?.address === rule.address && (
        <div className='absolute bottom-0 left-1/2 h-4 w-[1px] -translate-x-1/2 translate-y-full bg-gray-900'></div>
      )}
    </div>
  );
};

interface WrapperButtonProps {
  rule: EligibilityRule;
  labeledModules: LabeledModules | undefined;
  customYesNo?: { yes: string; no: string };
  isReadyToClaim?: boolean;
  children: ReactNode;
}

const ModuleChainClaimButton = ({ rule, labeledModules }: ModuleChainClaimButtonProps) => {
  if (rule.address === get(labeledModules, 'selection')) {
    return (
      <WrapperButton rule={rule} labeledModules={labeledModules}>
        Appointed
      </WrapperButton>
    );
  }

  if (rule.address === get(labeledModules, 'criteria')) {
    return (
      <WrapperButton rule={rule} labeledModules={labeledModules}>
        Compliant
      </WrapperButton>
    );
  }

  const shortName = first(get(rule, 'module.name').split(' Eligibility'));

  return (
    <WrapperButton rule={rule} labeledModules={labeledModules}>
      {shortName}
    </WrapperButton>
  );
};

interface ModuleChainClaimButtonProps {
  rule: EligibilityRule;
  labeledModules: LabeledModules | undefined;
}

const sortRulesForClaims = (rules: EligibilityRule[]) => {
  const allowlistModules = rules.filter((rule) => rule.module.id.includes('allowlist'));
  const otherModules = rules.filter(
    (rule) => !rule.module.id.includes('allowlist') && !rule.module.id.includes('public-lock-v14'),
  );
  const subscriptionModules = rules.filter((rule) => rule.module.id.includes('public-lock-v14'));

  // TODO sort rules for claims
  return concat(
    allowlistModules, // first allowlist modules
    otherModules, // then other modules
    subscriptionModules, // last subscription modules
  );
};

const AndIcon = () => (
  <svg width='10' height='11' viewBox='0 0 10 11' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path d='M1 10L5 2L9 10' stroke='currentColor' strokeLinecap='round' />
  </svg>
);

const AndDecorator = () => (
  <div className='flex items-center'>
    <div className='relative flex h-[1px] w-16 items-center bg-gray-900'>
      <div className='absolute left-1/2 top-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border border-gray-900 bg-white text-gray-900'>
        <AndIcon />
      </div>
    </div>
  </div>
);

const ArrowDecorator = () => (
  <div className='flex flex-1 items-center'>
    <div className='relative flex h-[1px] w-full items-center bg-gray-900'>
      <div className='absolute left-6 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-sm border border-gray-900 bg-white'>
        <BsArrowRight className='h-2.5 w-2.5 text-gray-900' />
      </div>
    </div>
  </div>
);

const ModuleChainClaimButtons = ({ labeledModules, showJoinButton = false }: ModuleChainClaimButtonsProps) => {
  const { eligibilityRules } = useEligibility();

  const flatRules = flatten(eligibilityRules); // TODO only handling AND chains currently
  const sortedRules = sortRulesForClaims(flatRules);

  return (
    <div
      className={cn('flex items-center', {
        'flex-1': showJoinButton, // Only take up full width when showing join button
      })}
    >
      {map(sortedRules, (rule, index) => (
        <React.Fragment key={`${rule.module.id}-${rule.address}`}>
          <ModuleChainClaimButton rule={rule} labeledModules={labeledModules} />
          {index < sortedRules.length - 1 ? <AndDecorator /> : showJoinButton ? <ArrowDecorator /> : null}
        </React.Fragment>
      ))}
    </div>
  );
};

interface ModuleChainClaimButtonsProps {
  labeledModules?: LabeledModules | undefined;
  showJoinButton?: boolean;
}

export { ModuleChainClaimButtons };
