'use client';

import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { find, first, get, pick } from 'lodash';
import { useErc1155Details } from 'modules-hooks';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { Link, Tooltip } from 'ui';
import { explorerUrl, formatAddress, ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../eligibility-rules';

export const Erc1155EligibilityRule = ({ moduleParameters, wearer, chainId }: ModuleDetailsHandler) => {
  const tokenParam = find(moduleParameters, (p: ModuleParameter) => p.displayType === 'erc1155');
  // Multi ERC1155 handles multiple tokens and balances
  // TODO handle multiple tokenIds
  const minBalances = find(moduleParameters, {
    label: 'Minimum Balances',
  });
  const minBalance = first(get(minBalances, 'value') as bigint[]);
  const amountValueDisplay = minBalance?.toString() || '0';

  const tokenIds = find(moduleParameters, { label: 'Token IDs' });
  const tokenId = first(get(tokenIds, 'value') as (Hex | bigint)[]);
  const { data: erc1155Details } = useErc1155Details({
    contractAddress: tokenParam?.value as Hex,
    wearerAddress: wearer,
    tokenId,
    chainId,
  });
  const { userBalance, userBalanceDisplay } = pick(erc1155Details, ['userBalance', 'userBalanceDisplay']);

  // check eligibility
  if (userBalance && minBalance && userBalance >= minBalance) {
    // TODO handle is wearer vs not (hold/retain)
    return (
      <EligibilityRuleDetails
        rule={
          <div className='flex items-center gap-1'>
            <p>
              Hold at least {amountValueDisplay}{' '}
              <Link href={`${explorerUrl(chainId)}/address/${tokenParam?.value}`} className='underline'>
                {formatAddress(tokenParam?.value as Hex)}
              </Link>{' '}
              token with ID
            </p>
            <Tooltip label={tokenId?.toString()}>
              <p className='max-w-50px line-clamp-1'>{tokenId?.toString()}</p>
            </Tooltip>
          </div>
        }
        status={ELIGIBILITY_STATUS.eligible}
        displayStatus={userBalanceDisplay}
        icon={BsCheckSquareFill}
      />
    );
  }

  // fallback
  return (
    <EligibilityRuleDetails
      rule={
        <div className='flex items-center gap-1'>
          <p>
            Hold at least {amountValueDisplay}{' '}
            <Link href={`${explorerUrl(chainId)}/address/${tokenParam?.value}`} className='underline'>
              {formatAddress(tokenParam?.value as Hex)}
            </Link>{' '}
            token with ID
          </p>
          <Tooltip label={tokenId?.toString()}>
            <p className='max-w-50px line-clamp-1'>{tokenId?.toString()}</p>
          </Tooltip>
        </div>
      }
      status={ELIGIBILITY_STATUS.ineligible}
      displayStatus={userBalanceDisplay}
      icon={BsFillXOctagonFill}
    />
  );
};
