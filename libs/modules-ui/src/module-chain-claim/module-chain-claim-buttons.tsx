'use client';

import { useEligibility } from 'contexts';
import { concat, first, flatten, get, map, pick } from 'lodash';
import { useSubscriptionClaim } from 'modules-hooks';
import { ReactNode } from 'react';
import { BsCheckSquare, BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { EligibilityRule } from 'types';
import { cn } from 'ui';
import { Button } from 'ui';
import { Hex } from 'viem';

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

const getYesNoForRule = (rule: EligibilityRule) => {
  if (rule.module.id.includes('allowlist')) {
    return { yes: 'Allowed', no: 'Not Allowed' };
  }
  if (rule.module.id.includes('public-lock-v14')) {
    return { yes: 'Paid', no: 'Not Paid' };
  }
  if (rule.module.id.includes('agreement')) {
    return { yes: 'Signed', no: 'Not Signed' };
  }

  return undefined;
};

const WrapperButton = ({ rule, customYesNo, children }: WrapperButtonProps) => {
  const { currentEligibility, activeRule, setActiveRule, isReadyToClaim, chainId } = useEligibility();
  const isEligible =
    get(currentEligibility, `[${rule.address}].eligible`) && get(currentEligibility, `[${rule.address}].goodStanding`);

  const yesNoForRule = getYesNoForRule(rule); // use yes/no from rule if available

  // TODO handle has key but 0 allowance
  const { hasAllowance } = useSubscriptionClaim({
    moduleDetails: rule.module,
    moduleParameters: rule.liveParams,
    chainId,
    setStatus: () => {},
    handlePendingTx: undefined, // only needed for purchasing/claiming
  });

  return (
    <Button
      variant='outline'
      onClick={() => setActiveRule(rule)}
      className={cn('block-size-auto h-auto w-auto justify-start whitespace-normal bg-white p-4', {
        'border-2 border-gray-800': activeRule?.address === rule.address,
        'border border-gray-300': activeRule?.address !== rule.address,
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
  );
};

interface WrapperButtonProps {
  rule: EligibilityRule;
  customYesNo?: { yes: string; no: string };
  isReadyToClaim?: boolean;
  children: ReactNode;
}

const ModuleChainClaimButton = ({ rule, labeledModules }: ModuleChainClaimButtonProps) => {
  if (rule.address === get(labeledModules, 'selection')) {
    return <WrapperButton rule={rule}>Appointed</WrapperButton>;
  }

  if (rule.address === get(labeledModules, 'criteria')) {
    return <WrapperButton rule={rule}>Compliant</WrapperButton>;
  }

  const shortName = first(get(rule, 'module.name').split(' Eligibility'));

  return <WrapperButton rule={rule}>{shortName}</WrapperButton>;
};

interface ModuleChainClaimButtonProps {
  rule: EligibilityRule;
  labeledModules?: LabeledModules;
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

const ModuleChainClaimButtons = ({ labeledModules }: ModuleChainClaimButtonsProps) => {
  const { eligibilityRules } = useEligibility();

  const flatRules = flatten(eligibilityRules); // TODO only handling AND chains currently
  const sortedRules = sortRulesForClaims(flatRules);

  return (
    <div className='flex gap-2'>
      {map(sortedRules, (rule) => (
        <ModuleChainClaimButton key={`${rule.module.id}-${rule.address}`} rule={rule} labeledModules={labeledModules} />
      ))}
    </div>
  );
};

interface LabeledModules {
  [key: string]: Hex;
}

interface ModuleChainClaimButtonsProps {
  labeledModules?: LabeledModules;
}

export { ModuleChainClaimButtons };
