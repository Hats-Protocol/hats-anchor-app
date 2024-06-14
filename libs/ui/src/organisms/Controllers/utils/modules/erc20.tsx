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
  const tokenFields = ['symbol', 'name', 'decimals'];
  const tokenFieldContracts = _.map(tokenFields, (field) => ({
    address: tokenParam?.value as Hex,
    abi: erc20Abi,
    chainId,
    functionName: field,
  }));
  // TODO better default
  if (!tokenParam || !chainId) return DEFAULT_ELIGIBILITY_DETAILS;
  const promises: Promise<unknown>[] = [
    viemPublicClient(chainId).multicall({
      contracts: tokenFieldContracts,
    }),
  ];
  if (wearer) {
    promises.push(
      viemPublicClient(chainId).readContract({
        address: tokenParam.value as Hex,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [wearer],
      }),
    );
  }
  const result = await Promise.all(promises);
  const [tokenDetails, userBalance] = result as [any, any];
  console.log({ tokenDetails, userBalance });

  const amountParameter = _.find(moduleParameters, [
    'displayType',
    'amountWithDecimals',
  ]);
  const amountValueDisplay = formatUnits(
    (amountParameter?.value as bigint) || BigInt(0),
    tokenDetails?.decimals || 0,
  );
  const userBalanceDisplay = formatUnits(
    userBalance?.value || BigInt(0),
    tokenDetails?.decimals,
  );

  // calculate eligibility
  if (userBalance?.value >= (amountParameter?.value as bigint)) {
    // TODO handle is wearer vs not (hold/retain)
    return Promise.resolve({
      rule: (
        <Text size={{ base: 'sm', md: 'md' }}>
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
      <Text size={{ base: 'sm', md: 'md' }}>
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
