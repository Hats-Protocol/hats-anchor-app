'use client';

import { HStack, Text, Tooltip } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { find, first, get, pick } from 'lodash';
import { useErc1155Details } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { explorerUrl, formatAddress, ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import {
  ELIGIBILITY_STATUS,
  EligibilityRuleDetails,
} from '../eligibility-rules';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

export const Erc1155EligibilityRule = ({
  moduleParameters,
  wearer,
  chainId,
}: ModuleDetailsHandler) => {
  const tokenParam = find(
    moduleParameters,
    (p: ModuleParameter) => p.displayType === 'erc1155',
  );
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
  const { userBalance, userBalanceDisplay } = pick(erc1155Details, [
    'userBalance',
    'userBalanceDisplay',
  ]);

  // check eligibility
  if (userBalance && minBalance && userBalance >= minBalance) {
    // TODO handle is wearer vs not (hold/retain)
    return (
      <EligibilityRuleDetails
        rule={
          <HStack spacing={1}>
            <Text>
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
        <HStack spacing={1}>
          <Text>
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
      }
      status={ELIGIBILITY_STATUS.ineligible}
      displayStatus={userBalanceDisplay}
      icon={BsFillXOctagonFill}
    />
  );
};
