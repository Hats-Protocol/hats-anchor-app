'use client';

/* eslint-disable import/prefer-default-export */
import { HStack, Text, Tooltip } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill } from 'react-icons/bs';
import { ChakraNextLink } from 'ui';
import {
  explorerUrl,
  fetch1155BalanceWithId,
  fetchErc1155Details,
  formatAddress,
  ModuleDetailsHandler,
} from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../general';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

export const handleErc1155Eligibility = async ({
  moduleParameters,
  wearer,
  chainId,
}: ModuleDetailsHandler): Promise<EligibilityRuleDetails> => {
  const tokenParam = _.find(
    moduleParameters,
    (p: ModuleParameter) => p.displayType === 'erc1155',
  );
  // Multi ERC1155 handles multiple tokens and balances
  // TODO handle multiple tokenIds
  const tokenIds = _.find(moduleParameters, { label: 'Token IDs' });
  const minBalances = _.find(moduleParameters, {
    label: 'Minimum Balances',
  });
  const tokenId = _.first(_.get(tokenIds, 'value') as (Hex | bigint)[]);
  const minBalance = _.first(_.get(minBalances, 'value') as bigint[]);

  const promises: Promise<unknown>[] = [
    fetchErc1155Details({
      address: tokenParam?.value as Hex,
      tokenId,
      chainId,
    }),
  ];
  if (wearer) {
    promises.push(
      fetch1155BalanceWithId({
        address: wearer,
        token: tokenParam?.value as Hex,
        tokenId,
        chainId,
      }),
    );
  }
  const data = await Promise.all(promises);
  const [, userBalance] = data as [object, bigint | undefined];

  const amountValueDisplay = minBalance?.toString() || '0';
  const userBalanceDisplay = userBalance?.toString() || '0';

  // check eligibility
  if (userBalance && minBalance && userBalance >= minBalance) {
    // TODO handle is wearer vs not (hold/retain)
    return Promise.resolve({
      rule: (
        <HStack spacing={1}>
          <Text size={{ base: 'sm', md: 'md' }}>
            Hold at least {amountValueDisplay}{' '}
            <ChakraNextLink
              href={`${explorerUrl(chainId)}/address/${tokenParam?.value}`}
              decoration
            >
              {formatAddress(tokenParam?.value as Hex)}
            </ChakraNextLink>{' '}
            token with ID
          </Text>
          <Tooltip label={tokenId?.toString()}>
            <Text maxW='50px' isTruncated>
              {tokenId?.toString()}
            </Text>
          </Tooltip>
        </HStack>
      ),
      status: ELIGIBILITY_STATUS.eligible,
      displayStatus: userBalanceDisplay,
      icon: BsCheckSquareFill,
    });
  }

  // fallback
  return Promise.resolve({
    rule: (
      <HStack spacing={1}>
        <Text size={{ base: 'sm', md: 'md' }}>
          Hold at least {amountValueDisplay}{' '}
          <ChakraNextLink
            href={`${explorerUrl(chainId)}/address/${tokenParam?.value}`}
            decoration
          >
            {formatAddress(tokenParam?.value as Hex)}
          </ChakraNextLink>{' '}
          token with ID
        </Text>
        <Tooltip label={tokenId?.toString()}>
          <Text maxW='50px' isTruncated>
            {tokenId?.toString()}
          </Text>
        </Tooltip>
      </HStack>
    ),
    status: ELIGIBILITY_STATUS.ineligible,
    displayStatus: userBalanceDisplay,
    icon: RemovedWearer,
  });
};
