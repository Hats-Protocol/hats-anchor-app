'use client';

import { Heading, Stack, Text } from '@chakra-ui/react';
import { NETWORK_CURRENCY } from '@hatsprotocol/constants';
import { useTreasury } from 'contexts';
import { useApprovedTokens, useSafeTokens, useTokenPrices } from 'hooks';
import { find, get, isEmpty, toNumber, toString, toUpper } from 'lodash';
import { useMemo } from 'react';
import { filterTokenList, formatRound, symbolPriceHandler } from 'utils';
import { formatUnits, Hex } from 'viem';

const SafeTotal = ({ safeAddress }: { safeAddress: Hex }) => {
  const { chainId } = useTreasury();

  const { data: approvedTokens } = useApprovedTokens();
  const { data: safeTokens } = useSafeTokens({
    safeAddress,
    chainId,
  });
  const { data: prices } = useTokenPrices();

  const filteredSafeTokens = filterTokenList({
    tokenList: safeTokens,
    approvedTokens,
  });

  const total = useMemo(() => {
    if (isEmpty(filteredSafeTokens) || isEmpty(prices) || !chainId) return 0;

    return filteredSafeTokens.reduce((usdBal, token) => {
      const price = find(prices, {
        symbol:
          toUpper(symbolPriceHandler(get(token, 'token.symbol'))) || symbolPriceHandler(NETWORK_CURRENCY[chainId]),
      });
      if (!price) return usdBal;

      return (
        usdBal +
        toNumber(formatUnits(BigInt(token.balance), get(token, 'token.decimals', 18))) * toNumber(price.priceUsd)
      );
    }, 0);
  }, [filteredSafeTokens, prices, chainId]);

  return (
    <Stack align='center' spacing={0}>
      <Text size='sm'>Total</Text>
      <Heading variant='medium'>
        $
        {formatRound({
          value: toString(total),
        })}
      </Heading>
    </Stack>
  );
};

export default SafeTotal;
