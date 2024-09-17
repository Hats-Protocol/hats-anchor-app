'use client';

import { Text, Tooltip } from '@chakra-ui/react';
import { find, pick } from 'lodash';
import { useErc20Details } from 'modules-hooks';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { ModuleDetailsHandler } from 'utils';
import { formatUnits, Hex } from 'viem';

import { ELIGIBILITY_STATUS } from '../utils';
import EligibilityRule from './EligibilityRule';

const Erc20Eligibility = ({
  moduleParameters,
  wearer,
  chainId,
}: ModuleDetailsHandler) => {
  const tokenParam = find(moduleParameters, { displayType: 'erc20' });
  const amountParameter = find(moduleParameters, [
    'displayType',
    'amountWithDecimals',
  ]);

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
    ? formatUnits(
        amountParameter?.value as bigint,
        tokenDetails?.decimals || 18,
      )
    : undefined;

  // calculate eligibility
  if (userBalance && userBalance >= (amountParameter?.value as bigint)) {
    // TODO handle is wearer vs not (hold/retain)
    return (
      <EligibilityRule
        rule={
          <Text>
            Retain at least {amountValueDisplay}
            <Tooltip label={tokenDetails?.name}>
              <Text as='span' variant='cashtag'>
                ${tokenDetails?.symbol}
              </Text>
            </Tooltip>
          </Text>
        }
        displayStatus={userBalanceDisplay}
        status={ELIGIBILITY_STATUS.eligible}
        icon={BsCheckSquareFill}
      />
    );
  }

  // fallback to ineligible
  return (
    <EligibilityRule
      rule={
        <Text>
          Hold at least {amountValueDisplay}{' '}
          <Tooltip label={tokenDetails?.name}>
            <Text as='span' variant='cashtag'>
              ${tokenDetails?.symbol}
            </Text>
          </Tooltip>
        </Text>
      }
      displayStatus={userBalanceDisplay}
      status={ELIGIBILITY_STATUS.ineligible}
      icon={BsFillXOctagonFill}
    />
  );
};

export default Erc20Eligibility;
