import { Flex, HStack, Icon, Stack, Text, Tooltip } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { explorerUrl, formatAddress, formatDate, jokeRaceUrl } from 'app-utils';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
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
  label,
  link,
  linkLabel,
  tip,
}: {
  label: string;
  link?: string;
  linkLabel: string;
  tip?: string;
}) => {
  const isExternal = link?.includes('http');
  return (
    <Flex key={label} justify='space-between' gap={3}>
      <Text fontSize='sm'>{label}</Text>

      {link ? (
        <Tooltip label={tip} placement='left'>
          <ChakraNextLink href={link} isExternal={isExternal}>
            <HStack spacing={1} color='gray.500'>
              <Text fontSize='sm'>{linkLabel}</Text>
              {isExternal && <Icon as={FiExternalLink} h='14px' />}
            </HStack>
          </ChakraNextLink>
        </Tooltip>
      ) : (
        <Tooltip label={tip} placement='left'>
          <Text fontSize='sm' color='gray.500'>
            {linkLabel}
          </Text>
        </Tooltip>
      )}
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
    if (param.displayType === 'jokerace') {
      return (
        <ModuleParameterRow
          label={param.label}
          link={jokeRaceUrl({ chainId, address: param.value as string })}
          linkLabel={`JokeRace (${formatAddress(param.value as string)})`}
        />
      );
    }

    let tokenLabel = formatAddress(param.value as string);
    if (tokenName) {
      tokenLabel = `${tokenName} (${formatAddress(param.value as string)})`;
    }

    return (
      <ModuleParameterRow
        label={param.label}
        link={`${explorerUrl(chainId)}/address/${param.value}`}
        linkLabel={tokenLabel}
      />
    );
  }
  if (_.includes(numberTypes, param.solidityType)) {
    if (param.displayType === 'hat') {
      return (
        <ModuleParameterRow
          label={param.label}
          link={`/trees/${chainId}/${hatIdToTreeId(
            param.value as bigint,
          )}?hatId=${hatIdDecimalToIp(param.value as bigint)}`}
          linkLabel={`#${hatIdDecimalToIp(param.value as bigint)}`}
        />
      );
    }
    if (tokenDecimals) {
      const amount = `${formatUnits(
        BigInt(param.value as bigint),
        _.toNumber(tokenDecimals),
      ).toString()}
      ${tokenSymbol as string}`;
      return <ModuleParameterRow label={param.label} linkLabel={amount} />;
    }
    if (param.displayType === 'timestamp') {
      if (param.value === BigInt(0)) {
        return <ModuleParameterRow label={param.label} linkLabel='Not Set' />;
      }
      const date = new Date(
        _.toNumber((param.value as bigint).toString()) * 1000,
      );
      return (
        <ModuleParameterRow
          label={param.label}
          tip={formatDate(date)}
          linkLabel={`${formatDistanceToNow(date)} 
        ${new Date() > date ? 'ago' : 'from now'}`}
        />
      );
    }
    return (
      <ModuleParameterRow
        label={param.label}
        linkLabel={BigInt(param.value as bigint).toString()}
      />
    );
  }

  return (
    <ModuleParameterRow label={param.label} linkLabel={param.value as string} />
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
