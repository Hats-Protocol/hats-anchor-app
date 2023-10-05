import { Flex, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import React, { ReactNode } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { formatUnits, Hex } from 'viem';
import { erc20ABI, useContractReads } from 'wagmi';

import { formatAddress } from '@/lib/general';
import { explorerUrl } from '@/lib/web3';

import ChakraNextLink from './atoms/ChakraNextLink';

const ModuleParameters = ({
  parameters,
  chainId,
}: {
  parameters: ModuleParameter[] | undefined;
  chainId: number | undefined;
}) => {
  const moduleToken = _.get(
    _.find(parameters, ['label', 'Token Address']),
    'value',
  ) as Hex;

  const { data: tokenData } = useContractReads({
    contracts: [
      {
        abi: erc20ABI,
        address: moduleToken,
        functionName: 'name',
      },
      { abi: erc20ABI, address: moduleToken, functionName: 'decimals' },
      { abi: erc20ABI, address: moduleToken, functionName: 'symbol' },
    ],
    enabled: !!moduleToken,
  });
  const [tokenName, tokenDecimals, tokenSymbol] =
    _.map(tokenData, 'result') || [];

  return (
    <Stack>
      {_.map(parameters, (param) => {
        let displayValue: ReactNode = (
          <Text fontSize='sm'>{param.value as string}</Text>
        );
        if (param.solidityType === 'address') {
          displayValue = (
            <ChakraNextLink
              href={`${explorerUrl(chainId)}/address/${param.value}`}
              isExternal
            >
              <HStack spacing={1} color='gray.500'>
                <Text fontSize='sm'>
                  {tokenName ? `${tokenName} ` : ''}
                  {tokenName
                    ? `(${formatAddress(param.value as string)})`
                    : formatAddress(param.value as string)}
                </Text>
                <Icon as={FiExternalLink} h='14px' />
              </HStack>
            </ChakraNextLink>
          );
        } else if (param.solidityType === 'uint256') {
          if (tokenDecimals) {
            displayValue = (
              <Text fontSize='sm' color='gray.500'>
                {formatUnits(
                  BigInt(param.value as bigint),
                  _.toNumber(tokenDecimals),
                ).toString()}{' '}
                {tokenSymbol as string}
              </Text>
            );
          } else {
            displayValue = (
              <Text fontSize='sm' color='gray.500'>
                {BigInt(param.value as bigint).toString()}
              </Text>
            );
          }
        }

        return (
          <Flex key={param.label} justify='space-between' gap={3}>
            <Text fontSize='sm'>{param.label}</Text>
            {displayValue}
          </Flex>
        );
      })}
    </Stack>
  );
};

export default ModuleParameters;
