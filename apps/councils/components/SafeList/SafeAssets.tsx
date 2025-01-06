'use client';

import { Box, Flex, Heading, HStack, Image, Stack, Text } from '@chakra-ui/react';
import { NETWORK_CURRENCY, OVERRIDE_TOKEN_IMAGE } from '@hatsprotocol/constants';
import { useApprovedTokens, useSafeTokens, useTokenDetails, useTokenPrices } from 'hooks';
import { find, get, includes, isEmpty, map, toLower, toUpper } from 'lodash';
import {
  filterTokenList,
  formatBalanceValue,
  formatRoundedDecimals,
  symbolPriceHandler,
  tokenImageHandler,
} from 'utils';
import { Hex } from 'viem';

const SafeAssetRow = ({ token, chainId }: { token: any; chainId: number }) => {
  const { data: prices } = useTokenPrices();

  const localTokenImage = !includes(OVERRIDE_TOKEN_IMAGE, get(token, 'tokenAddress'))
    ? get(token, 'token.logoUri')
    : undefined;
  const localTokenSymbol =
    (get(token, 'token.symbol') ? symbolPriceHandler(get(token, 'token.symbol')) : undefined) ||
    (chainId ? symbolPriceHandler(NETWORK_CURRENCY[chainId]) : undefined);
  const priceDetails = find(prices, {
    symbol: toUpper(localTokenSymbol),
  });
  const { data: tokenData } = useTokenDetails({
    symbol: toLower(localTokenSymbol),
  });

  if (!chainId) return null;

  const tokenImage = tokenImageHandler({
    symbol: get(token, 'token.symbol'),
    primaryImage: get(tokenData, 'avatar'),
    backupImage: localTokenImage,
    chainId,
  });

  return (
    <Flex justify='space-between'>
      {formatBalanceValue({
        price: get(priceDetails, 'priceUsd'),
        balance: token.balance,
        decimals: get(token, 'token.decimals', 18),
      }) ? (
        <Heading size='xl'>
          $
          {formatBalanceValue({
            price: get(priceDetails, 'priceUsd'),
            balance: token.balance,
            decimals: get(token, 'token.decimals', 18),
          })}
        </Heading>
      ) : (
        <Box>&nbsp;</Box>
      )}

      <HStack key={token.address}>
        <Heading size='lg' variant='medium'>
          {formatRoundedDecimals({
            value: token.balance,
            decimals: get(token, 'token.decimals'),
          })}
        </Heading>
        <HStack spacing={1}>
          <Image src={tokenImage} boxSize={4} alt='token image' />
          <Text size='sm'>{get(token, 'token.symbol', get(NETWORK_CURRENCY, chainId || 1))}</Text>
        </HStack>
      </HStack>
    </Flex>
  );
};

const SafeAssets = ({ safeAddress, chainId }: { safeAddress: Hex; chainId: number }) => {
  const { data: approvedTokens } = useApprovedTokens();
  const { data: safeTokens } = useSafeTokens({
    safeAddress,
    chainId,
  });

  const filteredSafeTokens = filterTokenList({
    tokenList: safeTokens,
    approvedTokens,
  });

  if (!chainId) return null;

  if (isEmpty(filteredSafeTokens)) {
    return (
      <Flex w='full'>
        <Stack w='full'>
          <Heading variant='medium' size='sm'>
            Assets
          </Heading>

          <Text>None found</Text>
        </Stack>
      </Flex>
    );
  }

  return (
    <Flex w='full'>
      <Stack w='full'>
        <Heading variant='medium' size='sm'>
          Assets
        </Heading>

        {map(filteredSafeTokens, (token: any) => (
          <SafeAssetRow token={token} chainId={chainId} key={token.tokenAddress || 'native currency'} />
        ))}
      </Stack>
    </Flex>
  );
};

export default SafeAssets;
