/* eslint-disable import/prefer-default-export */
import { Text, Tooltip } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill } from 'react-icons/bs';
import { ModuleDetailsHandler } from 'utils';
import { formatUnits, Hex } from 'viem';
import {
  fetchBalance,
  FetchBalanceResult,
  fetchToken,
  FetchTokenResult,
} from 'wagmi/actions';

import { ELIGIBILITY_STATUS } from '../general';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

export const handleErc20Eligibility = async ({
  moduleParameters,
  wearer,
  chainId,
}: ModuleDetailsHandler) => {
  const tokenParam = _.find(
    moduleParameters,
    (p: ModuleParameter) => p.displayType === 'erc20',
  );
  const promises: Promise<unknown>[] = [
    fetchToken({
      address: tokenParam?.value as Hex,
      chainId,
    }),
  ];
  if (wearer) {
    promises.push(
      fetchBalance({
        address: wearer,
        token: tokenParam?.value as Hex,
        chainId,
      }),
    );
  }
  const result = await Promise.all(promises);
  const [tokenDetails, userBalance] = result as [
    FetchTokenResult,
    FetchBalanceResult,
  ];

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
    // TODO handle is wearer vs not (hold/retain)
    return Promise.resolve({
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
    });
  }

  // fallback to ineligible
  return Promise.resolve({
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
  });
};
