'use client';

import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useEligibility } from 'contexts';
import { concat, find, first, flatten, get, map, pick } from 'lodash';
import { useErc20Details } from 'modules-hooks';
import { useSubscriptionClaim } from 'modules-hooks';
import posthog from 'posthog-js';
import { Fragment, ReactNode, useCallback, useEffect } from 'react';
import { BsArrowRight, BsCheckSquare, BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { EligibilityRule, LabeledModules } from 'types';
import { cn } from 'ui';
import { Button } from 'ui';
import { formatUnits, Hex } from 'viem';

interface Erc20Details {
  userBalance: bigint;
  userBalanceDisplay: string;
  tokenDetails: {
    symbol: string;
    name: string;
    decimals: number;
  };
}

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
    setStatus: () => undefined,
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
          'border border-[#2D3748] bg-gray-50': activeRule?.address !== rule.address,
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
  const { chainId } = useEligibility();

  const isErc20 = rule.module.id.includes('erc20');
  const tokenParam = isErc20 ? (find(rule.liveParams, { displayType: 'erc20' }) as ModuleParameter) : undefined;
  const amountParameter = isErc20
    ? (find(rule.liveParams, { displayType: 'amountWithDecimals' }) as ModuleParameter)
    : undefined;

  const tokenAddress = tokenParam?.value as string;
  const { data: erc20Details, isLoading: isErc20Loading } = useErc20Details({
    contractAddress: tokenAddress ? (tokenAddress.toLowerCase() as Hex) : undefined,
    wearerAddress: '0x0000000000000000000000000000000000000000' as Hex, // use zero address since we don't need balance to display in the button
    chainId,
  });

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

  // ERC20 Module:
  if (isErc20) {
    // show 'ERC20' as the loading state while fetching token details
    if (isErc20Loading) {
      return (
        <WrapperButton rule={rule} labeledModules={labeledModules}>
          ERC20
        </WrapperButton>
      );
    }

    const { tokenDetails } = pick(erc20Details || {}, ['tokenDetails']) as Partial<Erc20Details>;

    if (tokenDetails?.symbol && amountParameter?.value && tokenDetails.decimals !== undefined) {
      const minimumBalanceDisplay = formatUnits(amountParameter.value as bigint, tokenDetails.decimals);
      const minimumBalanceNumber = parseFloat(minimumBalanceDisplay);

      return (
        <WrapperButton rule={rule} labeledModules={labeledModules}>
          Hold {minimumBalanceNumber === 1 ? '1' : minimumBalanceDisplay} {tokenDetails.symbol}
        </WrapperButton>
      );
    }

    // fallback incase something goes wrong with the token details fetch
    return (
      <WrapperButton rule={rule} labeledModules={labeledModules}>
        ERC20
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

interface ModuleChainClaimButtonsProps {
  labeledModules?: LabeledModules | undefined;
  showJoinButton?: boolean;
  className?: string;
}

const ModuleChainClaimButtons = ({
  labeledModules,
  showJoinButton = false,
  className,
}: ModuleChainClaimButtonsProps) => {
  const { eligibilityRules, currentEligibility, isReadyToClaim, activeRule, setActiveRule } = useEligibility();

  const flatRules = flatten(eligibilityRules); // TODO only handling AND chains currently

  // helper function to check if a rule is completed
  const isRuleCompleted = useCallback(
    (rule: EligibilityRule) => {
      const isEligible =
        get(currentEligibility, `[${rule.address}].eligible`) &&
        get(currentEligibility, `[${rule.address}].goodStanding`);
      const isReadyToClaimRule = get(isReadyToClaim, rule.address, false);

      // only consider them Agreement Module complete when fully eligible (not pending)
      if (rule.module.id.includes('agreement')) {
        return isEligible;
      }

      // other modules are complete if eligible or ready to claim
      return isEligible || isReadyToClaimRule;
    },
    [currentEligibility, isReadyToClaim],
  );

  // helper function to check if rule is agreement
  const isAgreement = (rule: EligibilityRule) => {
    return rule.module.id.includes('agreement');
  };

  // sort rules into three groups:
  // 1. completed modules (including completed agreements)
  const completedRules = flatRules.filter((rule) => isRuleCompleted(rule));

  // 2. incomplete non-agreement modules
  const incompleteRules = flatRules.filter((rule) => !isAgreement(rule) && !isRuleCompleted(rule));

  // 3. incomplete/pending agreement modules
  const incompleteAgreementRules = flatRules.filter((rule) => isAgreement(rule) && !isRuleCompleted(rule));

  const sortedRules = concat(completedRules, incompleteRules, incompleteAgreementRules);

  // Set the first incomplete non-agreement module as active when eligibility is determined
  useEffect(() => {
    // Only proceed if we have currentEligibility data and no active rule set
    if (!currentEligibility || activeRule) return;

    // Find the first incomplete non-agreement rule
    const firstIncompleteRule = flatRules.find((rule) => {
      if (isAgreement(rule)) return false;
      return !isRuleCompleted(rule);
    });

    if (firstIncompleteRule) {
      setActiveRule(firstIncompleteRule);
    }
  }, [currentEligibility, flatRules, isAgreement, isRuleCompleted, setActiveRule, activeRule]);

  return (
    <div
      className={cn(
        'flex items-center',
        {
          'flex-1': showJoinButton, // Only take up full width when showing join button
        },
        className,
      )}
    >
      {map(sortedRules, (rule, index) => (
        <Fragment key={`${rule.module.id}-${rule.address}`}>
          <ModuleChainClaimButton rule={rule} labeledModules={labeledModules} />
          {index < sortedRules.length - 1 ? <AndDecorator /> : showJoinButton ? <ArrowDecorator /> : null}
        </Fragment>
      ))}
    </div>
  );
};

export { ModuleChainClaimButtons };

const AndIcon = () => (
  <svg width='10' height='11' viewBox='0 0 10 11' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path d='M1 10L5 2L9 10' stroke='currentColor' strokeLinecap='round' />
  </svg>
);

const AndDecorator = () => (
  <div className='flex items-center'>
    <div className='relative flex h-[1px] w-8 items-center bg-gray-900'>
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
