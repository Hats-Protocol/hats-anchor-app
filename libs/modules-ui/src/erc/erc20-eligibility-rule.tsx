'use client';

import { find, pick } from 'lodash';
import { useErc20Details } from 'modules-hooks';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { cn, Tooltip } from 'ui';
import { ModuleDetailsHandler } from 'utils';
import { formatUnits, Hex } from 'viem';

import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../eligibility-rules';

const cashtag = 'inline-block bg-slate-100 px-1 font-medium text-slate-700 underline';

export const Erc20EligibilityRule = ({ moduleParameters, wearer, chainId }: ModuleDetailsHandler) => {
  const tokenParam = find(moduleParameters, { displayType: 'erc20' });
  const amountParameter = find(moduleParameters, ['displayType', 'amountWithDecimals']);

  const { data: erc20Details } = useErc20Details({
    contractAddress: tokenParam?.value as Hex,
    wearerAddress: wearer,
    chainId,
  });
  const { userBalance, userBalanceDisplay, tokenDetails } = pick(erc20Details, [
    'userBalance',
    'userBalanceDisplay',
    'tokenDetails',
  ]);
  const amountValueDisplay = amountParameter?.value
    ? formatUnits(amountParameter?.value as bigint, tokenDetails?.decimals || 18)
    : undefined;

  // calculate eligibility
  if (userBalance && userBalance >= (amountParameter?.value as bigint)) {
    // TODO handle is wearer vs not (hold/retain)
    return (
      <EligibilityRuleDetails
        rule={
          <p>
            Retain at least {amountValueDisplay}
            <Tooltip label={tokenDetails?.name}>
              <span className={cn(cashtag)}>${tokenDetails?.symbol}</span>
            </Tooltip>
          </p>
        }
        displayStatus={userBalanceDisplay}
        status={ELIGIBILITY_STATUS.eligible}
        icon={BsCheckSquareFill}
      />
    );
  }

  // fallback to ineligible
  return (
    <EligibilityRuleDetails
      rule={
        <p>
          Hold at least {amountValueDisplay}{' '}
          <Tooltip label={tokenDetails?.name}>
            <span className={cn(cashtag)}>${tokenDetails?.symbol}</span>
          </Tooltip>
        </p>
      }
      displayStatus={userBalanceDisplay}
      status={ELIGIBILITY_STATUS.ineligible}
      icon={BsFillXOctagonFill}
    />
  );
};
