import { Flex, HStack, Icon, Stack, Text, Tooltip } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { format, formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import React, { ReactNode } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { formatUnits, Hex } from 'viem';

import useTokenData from '../hooks/useTokenData';
import { explorerUrl } from '../lib/chains';
import { formatAddress } from '../lib/general';
import ChakraNextLink from './atoms/ChakraNextLink';

const numberTypes = [
  'uint256',
  'uint8',
  'uint16',
  'uint32',
  'uint64',
  'uint248',
];

const ModuleParameters = ({
  parameters,
  chainId,
}: {
  parameters: ModuleParameter[] | undefined;
  chainId: number | undefined;
}) => {
  const tokenAddress = _.get(
    _.find(parameters, ['label', 'Token Address']),
    'value',
  ) as Hex;

  const { tokenName, tokenDecimals, tokenSymbol } = useTokenData(tokenAddress);

  return (
    <Stack>
      {_.map(parameters, (param: ModuleParameter) => {
        let displayValue: ReactNode = (
          <Text fontSize='sm'>{param.value as string}</Text>
        );
        if (param.solidityType === 'address') {
          // TODO handle joke race display type
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
        } else if (_.includes(numberTypes, param.solidityType)) {
          if (param.displayType === 'hat') {
            displayValue = (
              <Text fontSize='sm' color='gray.500'>
                #{hatIdDecimalToIp(param.value as bigint)}
              </Text>
            );
          } else if (tokenDecimals) {
            displayValue = (
              <Text fontSize='sm' color='gray.500'>
                {formatUnits(
                  BigInt(param.value as bigint),
                  _.toNumber(tokenDecimals),
                ).toString()}{' '}
                {tokenSymbol as string}
              </Text>
            );
          } else if (param.displayType === 'timestamp') {
            const date = new Date(
              _.toNumber((param.value as bigint).toString()) * 1000,
            );
            displayValue = (
              <Tooltip
                label={format(date, 'yyyy-MM-dd HH:mm:ss')}
                placement='left'
              >
                <Text fontSize='sm' color='gray.500'>
                  {formatDistanceToNow(date)}{' '}
                  {new Date() > date ? 'ago' : 'from now'}
                </Text>
              </Tooltip>
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
