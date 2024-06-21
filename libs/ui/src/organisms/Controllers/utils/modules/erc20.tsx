'use client';

/* eslint-disable import/prefer-default-export */
import { Text, Tooltip } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill } from 'react-icons/bs';
import { ModuleDetailsHandler, viemPublicClient } from 'utils';
import { erc20Abi, formatUnits, Hex } from 'viem';

import { DEFAULT_ELIGIBILITY_DETAILS, ELIGIBILITY_STATUS } from '../general';

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
  const amountParameter = _.find(moduleParameters, [
    'displayType',
    'amountWithDecimals',
  ]);

  const tokenFields = ['symbol', 'name', 'decimals'];
  console.log(chainId, wearer, tokenParam, amountParameter);
  const tokenFieldContracts = _.map(tokenFields, (field) => ({
    address: tokenParam?.value as Hex,
    abi: erc20Abi,
    functionName: field,
  }));

  // TODO better default
  if (!tokenParam || !chainId) {
    if (!wearer || !chainId) {
      return DEFAULT_ELIGIBILITY_DETAILS({});
    }

    return DEFAULT_ELIGIBILITY_DETAILS({ wearer, chainId });
  }

  let balanceOfWearer: any;
  if (wearer) {
    balanceOfWearer = {
      address: tokenParam.value as Hex,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [wearer],
    };
  }

  const result = await viemPublicClient(chainId).multicall({
    contracts: _.compact(_.concat(tokenFieldContracts, balanceOfWearer)),
  });
  const [symbol, name, decimals, userBalance] = _.map(result, 'result') as [
    string,
    string,
    number,
    bigint,
  ];
  console.log({ symbol, name, decimals, userBalance });

  const amountValueDisplay = formatUnits(
    (amountParameter?.value as bigint) || BigInt(0),
    decimals || 18,
  );
  const userBalanceDisplay = formatUnits(
    userBalance || BigInt(0),
    decimals || 18,
  );

  // calculate eligibility
  if (userBalance >= (amountParameter?.value as bigint)) {
    // TODO handle is wearer vs not (hold/retain)
    return Promise.resolve({
      rule: (
        <Text size={{ base: 'sm', md: 'md' }}>
          Retain at least {amountValueDisplay}
          <Tooltip label={name}>
            <Text as='span' variant='cashtag'>
              ${symbol}
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
      <Text size={{ base: 'sm', md: 'md' }}>
        Hold at least {amountValueDisplay}{' '}
        <Tooltip label={name}>
          <Text as='span' variant='cashtag'>
            ${symbol}
          </Text>
        </Tooltip>
      </Text>
    ),
    displayStatus: userBalanceDisplay,
    status: ELIGIBILITY_STATUS.ineligible,
    icon: RemovedWearer,
  });
};
