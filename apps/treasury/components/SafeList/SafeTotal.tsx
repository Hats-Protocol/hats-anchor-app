'use client';

import { Heading, Stack, Text } from '@chakra-ui/react';
import { useTreasury } from 'contexts';
import { useApprovedTokens, useSafeTokens, useTokenPrices } from 'hooks';
import { filter, find, get, includes, toNumber, toString } from 'lodash';
import { useMemo } from 'react';
import { formatRound } from 'utils';
import { formatUnits, Hex } from 'viem';

const SafeTotal = ({ safeAddress }: { safeAddress: Hex }) => {
  const { chainId } = useTreasury();

  const { data: approvedTokens } = useApprovedTokens();
  const { data: safeTokens } = useSafeTokens({
    safeAddress,
    chainId,
  });
  const { data: prices } = useTokenPrices();

  const filteredSafeTokens = useMemo(
    () =>
      filter(
        safeTokens,
        (token: any) =>
          token.balance > 0 &&
          (includes(approvedTokens, token.token.symbol) || !token.tokenAddress),
      ),
    [approvedTokens, safeTokens],
  );

  const total = useMemo(() => {
    return filteredSafeTokens.reduce((usdBal, token) => {
      const price = find(prices, { symbol: get(token, 'token.symbol') });
      if (!price) return usdBal;

      return (
        usdBal +
        toNumber(formatUnits(BigInt(token.balance), token.token.decimals)) *
          toNumber(price.priceUsd)
      );
    }, 0);
  }, [filteredSafeTokens, prices]);

  return (
    <Stack align='center' spacing={0}>
      <Text size='sm'>Total</Text>
      <Heading variant='medium'>
        $
        {formatRound({
          value: toString(total),
          startScientific: 4,
          dropDecimals: true,
        })}
      </Heading>
    </Stack>
  );
};

export default SafeTotal;
