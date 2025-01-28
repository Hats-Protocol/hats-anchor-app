'use client';

import { find, pick } from 'lodash';
import { useErc721Details } from 'modules-hooks';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { Link } from 'ui';
import { explorerUrl, formatAddress, ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../eligibility-rules';

export const Erc721EligibilityRule = ({ moduleParameters, wearer, chainId }: ModuleDetailsHandler) => {
  const tokenParam = find(moduleParameters, { displayType: 'erc721' });

  const { data: erc721Details } = useErc721Details({
    contractAddress: tokenParam?.value as Hex,
    wearerAddress: wearer,
    chainId,
  });
  const { tokenDetails, userBalance, userBalanceDisplay } = pick(erc721Details, [
    'tokenDetails',
    'userBalance',
    'userBalanceDisplay',
  ]);

  const amountParameter = find(moduleParameters, {
    label: 'Minimum Balance',
  });
  const amountParameterDisplay = (amountParameter?.value as bigint)?.toString() || '0';

  return (
    <EligibilityRuleDetails
      rule={
        <p>
          Hold at least {amountParameterDisplay}{' '}
          <Link href={`${explorerUrl(chainId)}/address/${tokenParam?.value}`} className='underline'>
            {tokenDetails?.name || formatAddress(tokenParam?.value as Hex)}
          </Link>
        </p>
      }
      status={
        userBalance && userBalance >= (amountParameter?.value as bigint)
          ? ELIGIBILITY_STATUS.eligible
          : ELIGIBILITY_STATUS.ineligible
      }
      displayStatus={userBalanceDisplay}
      icon={userBalance && userBalance >= (amountParameter?.value as bigint) ? BsCheckSquareFill : BsFillXOctagonFill}
    />
  );
};
