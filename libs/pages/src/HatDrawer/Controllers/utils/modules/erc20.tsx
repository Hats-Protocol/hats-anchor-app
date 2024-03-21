/* eslint-disable import/prefer-default-export */
import { Text, Tooltip } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill } from 'react-icons/bs';
import { formatUnits, Hex } from 'viem';
import { fetchBalance, fetchToken } from 'wagmi/actions';

import { ELIGIBILITY_STATUS } from '../general';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

export const handleErc20Eligibility = async ({
  tokenParam,
  moduleParameters,
  wearer,
  chainId,
}: {
  tokenParam: ModuleParameter;
  moduleParameters: ModuleParameter[];
  wearer: Hex;
  chainId: number;
}) => {
  const tokenDetails = await fetchToken({
    address: tokenParam.value as Hex,
    chainId,
  });
  const userBalance = await fetchBalance({
    address: wearer,
    token: tokenParam.value as Hex,
    chainId,
  });
  const amountParameter = _.find(moduleParameters, [
    'displayType',
    'amountWithDecimals',
  ]);
  const amountValueDisplay = formatUnits(
    (amountParameter?.value as bigint) || BigInt(0),
    tokenDetails?.decimals,
  );
  const userBalanceDisplay = formatUnits(
    userBalance?.value || BigInt(0),
    tokenDetails?.decimals,
  );

  // calculate eligibility
  if (userBalance.value >= (amountParameter?.value as bigint)) {
    return {
      rule: (
        <Text>
          Retain at least {amountValueDisplay}
          <Tooltip label={tokenDetails?.name}>
            <Text as='span' variant='cashtag'>
              ${tokenDetails?.symbol}
            </Text>
          </Tooltip>
        </Text>
      ),
      displayStatus: userBalanceDisplay,
      status: ELIGIBILITY_STATUS.eligible,
      icon: BsCheckSquareFill,
    };
  }

  // fallback to ineligible
  return {
    rule: (
      <Text>
        Hold at least {amountValueDisplay}{' '}
        <Tooltip label={tokenDetails?.name}>
          <Text as='span' variant='cashtag'>
            ${tokenDetails?.symbol}
          </Text>
        </Tooltip>
      </Text>
    ),
    displayStatus: userBalanceDisplay,
    status: ELIGIBILITY_STATUS.ineligible,
    icon: RemovedWearer,
  };
};
