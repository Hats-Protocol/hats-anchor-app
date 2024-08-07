import {
  Box,
  Flex,
  Heading,
  HStack,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react';
import {
  NETWORK_CURRENCY,
  NETWORK_CURRENCY_IMAGE,
  OVERRIDE_TOKEN_IMAGE,
} from '@hatsprotocol/constants';
import { useTreasury } from 'contexts';
import {
  useApprovedTokens,
  useSafeTokens,
  useTokenDetails,
  useTokenPrices,
} from 'hooks';
import { filter, find, get, includes, map, toLower, toUpper } from 'lodash';
import { formatBalanceValue, formatRoundedDecimals } from 'utils';
import { Hex } from 'viem';

const SafeAssetRow = ({ token }: { token: any }) => {
  const { chainId } = useTreasury();
  const { data: prices } = useTokenPrices();

  const localTokenImage = !includes(
    OVERRIDE_TOKEN_IMAGE,
    get(token, 'tokenAddress'),
  )
    ? get(token, 'token.logoUri')
    : undefined;
  const priceDetails = find(prices, {
    symbol: toUpper(get(token, 'token.symbol')),
  });
  const { data: tokenData } = useTokenDetails({
    symbol: toLower(get(token, 'token.symbol')),
  });

  if (!chainId) return null;

  return (
    <Flex justify='space-between'>
      {formatBalanceValue({
        price: get(priceDetails, 'priceUsd'),
        balance: token.balance,
        decimals: get(token, 'token.decimals'),
      }) ? (
        <Heading size='xl'>
          $
          {formatBalanceValue({
            price: get(priceDetails, 'priceUsd'),
            balance: token.balance,
            decimals: get(token, 'token.decimals'),
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
          <Image
            src={
              get(tokenData, 'avatar') ||
              localTokenImage ||
              NETWORK_CURRENCY_IMAGE[chainId]
            }
            boxSize={4}
            alt='token image'
          />
          <Text size='sm'>
            {get(token, 'token.symbol', get(NETWORK_CURRENCY, chainId || 1))}
          </Text>
        </HStack>
      </HStack>
    </Flex>
  );
};

const SafeAssets = ({ safeAddress }: { safeAddress: Hex }) => {
  const { chainId } = useTreasury();

  const { data: approvedTokens } = useApprovedTokens();
  const { data: safeTokens } = useSafeTokens({
    safeAddress,
    chainId,
  });

  const filteredSafeTokens = filter(
    safeTokens,
    (token: any) =>
      token.balance > 0 &&
      (includes(approvedTokens, get(token, 'token.symbol')) ||
        !token.tokenAddress),
  );

  if (!chainId) return null;

  if (!filteredSafeTokens) {
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
          <SafeAssetRow
            token={token}
            key={token.tokenAddress || 'native currency'}
          />
        ))}
      </Stack>
    </Flex>
  );
};

export default SafeAssets;
