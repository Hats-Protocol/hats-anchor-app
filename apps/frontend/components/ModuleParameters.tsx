import { Flex, HStack, Icon, Stack, Text, Tooltip } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { explorerUrl, formatAddress, formatDate } from 'app-utils';
import { format, formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import React, { ReactNode } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { formatUnits, Hex } from 'viem';
import { useToken } from 'wagmi';

import ChakraNextLink from './atoms/ChakraNextLink';

const numberTypes = [
  'uint256',
  'uint8',
  'uint16',
  'uint32',
  'uint64',
  'uint128',
  'uint248',
];

const ModuleParameterRow = ({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) => {
  return (
    <Flex key={label} justify='space-between' gap={3}>
      <Text fontSize='sm'>{label}</Text>
      {children}
    </Flex>
  );
};

const ModuleParameter = ({
  param,
  chainId,
  tokenData,
}: {
  param: ModuleParameter;
  chainId: number;
  tokenData: object;
}) => {
  const {
    decimals: tokenDecimals,
    symbol: tokenSymbol,
    name: tokenName,
  } = _.pick(tokenData, ['decimals', 'symbol', 'name']);

  if (param.solidityType === 'address') {
    // TODO handle joke race display type
    return (
      <ModuleParameterRow label={param.label}>
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
      </ModuleParameterRow>
    );
  }
  if (_.includes(numberTypes, param.solidityType)) {
    if (param.displayType === 'hat') {
      return (
        <ModuleParameterRow label={param.label}>
          <ChakraNextLink
            href={`/trees/${chainId}/${hatIdToTreeId(
              param.value as bigint,
            )}?hatId=${hatIdDecimalToIp(param.value as bigint)}`}
          >
            <Text fontSize='sm' color='gray.500'>
              #{hatIdDecimalToIp(param.value as bigint)}
            </Text>
          </ChakraNextLink>
        </ModuleParameterRow>
      );
    }
    if (tokenDecimals) {
      return (
        <ModuleParameterRow label={param.label}>
          <Text fontSize='sm' color='gray.500'>
            {formatUnits(
              BigInt(param.value as bigint),
              _.toNumber(tokenDecimals),
            ).toString()}{' '}
            {tokenSymbol as string}
          </Text>
        </ModuleParameterRow>
      );
    }
    if (param.displayType === 'timestamp') {
      if (param.value === BigInt(0)) {
        return (
          <ModuleParameterRow label={param.label}>
            <Text fontSize='sm' color='gray.500'>
              Not Set
            </Text>
          </ModuleParameterRow>
        );
      }
      const date = new Date(
        _.toNumber((param.value as bigint).toString()) * 1000,
      );
      return (
        <ModuleParameterRow label={param.label}>
          <Tooltip label={formatDate(date)} placement='left'>
            <Text fontSize='sm' color='gray.500'>
              {formatDistanceToNow(date)}{' '}
              {new Date() > date ? 'ago' : 'from now'}
            </Text>
          </Tooltip>
        </ModuleParameterRow>
      );
    }
    return (
      <ModuleParameterRow label={param.label}>
        <Text fontSize='sm' color='gray.500'>
          {BigInt(param.value as bigint).toString()}
        </Text>
      </ModuleParameterRow>
    );
  }

  return (
    <ModuleParameterRow label={param.label}>
      {param.value as string}
    </ModuleParameterRow>
  );
};

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

  const { data: tokenData } = useToken({ address: tokenAddress });

  return (
    <Stack>
      {_.map(parameters, (param: ModuleParameter) => (
        <ModuleParameter
          param={param}
          chainId={chainId}
          tokenData={tokenData}
          key={`${param.label}-${param.value}`}
        />
      ))}
    </Stack>
  );
};

export default ModuleParameters;
