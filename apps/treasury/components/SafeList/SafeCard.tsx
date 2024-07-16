import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { NETWORK_CURRENCY } from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { SafeInfoResponse } from '@safe-global/api-kit';
import { useSafeTokens, useSafeTransactions } from 'hooks';
import {
  every,
  filter,
  first,
  get,
  includes,
  map,
  round,
  some,
  toNumber,
} from 'lodash';
import { AppHat, HatSignerGate } from 'types';
import { chainsMap, formatAddress, ipfsUrl } from 'utils';
import { formatUnits, getAddress, Hex } from 'viem';

const EXCLUDE_TOKENS = ['0xB1c37407dC5f996fAbfC4Be599c966aD6DE50C68'];

const inboundTransactions = (transactions: any, safeAddress: Hex) => {
  return filter(
    transactions,
    (tx) =>
      some(
        tx.transfers,
        (transfer) => transfer.to === getAddress(safeAddress),
      ) &&
      every(tx.transfers, (transfer) => transfer.type !== 'ERC721_TRANSFER'),
  );
};

const outboundTransactions = (transactions: any, safeAddress: Hex) => {
  return filter(transactions, (tx) =>
    some(tx.transfers, (transfer) => transfer.from === getAddress(safeAddress)),
  );
};

const findLastInboundTransaction = (transactions: any, safeAddress: Hex) => {
  const inboundTx = inboundTransactions(transactions, safeAddress);
  return first(inboundTx);
};

const findLastOutboundTransaction = (transactions: any, safeAddress: Hex) => {
  const outboundTx = outboundTransactions(transactions, safeAddress);
  return first(outboundTx);
};

const SafeCard = ({
  hats,
  signerSafe,
  safeInfo,
  chainId,
}: {
  hats: AppHat[] | undefined;
  signerSafe: HatSignerGate;
  safeInfo: SafeInfoResponse | undefined;
  chainId: number | undefined;
}) => {
  const safeAddress = get(signerSafe, 'safe');
  const { data: safeTokens } = useSafeTokens({
    safeAddress,
    chainId,
  });
  const { data: safeTransactions } = useSafeTransactions({
    safeAddress,
    chainId,
  });
  const firstHat = get(hats, '[0]');
  const firstHatDetails = get(firstHat, 'detailsMetadata');
  const firstHatName = firstHatDetails
    ? get(JSON.parse(firstHatDetails), 'data.name')
    : get(firstHat, 'details');
  const imageUrl = ipfsUrl(get(firstHat, 'nearestImage'));
  const filteredSafeTokens = filter(
    safeTokens,
    (token) =>
      token.balance > 0 &&
      (!includes(EXCLUDE_TOKENS, token.tokenAddress) || !token.tokenAddress),
  );
  const lastInbound = findLastInboundTransaction(safeTransactions, safeAddress);
  const lastOutbound = findLastOutboundTransaction(
    safeTransactions,
    safeAddress,
  );
  // console.log(safeTransactions);

  if (!firstHat) return null;
  console.log(firstHat);

  return (
    <Skeleton isLoaded={!!get(signerSafe, 'safe')}>
      <Card w='100%'>
        <CardBody>
          <Stack spacing={6}>
            <Flex justify='space-between'>
              <HStack spacing={4}>
                <Box
                  boxSize='50px'
                  backgroundImage={imageUrl !== '#' ? imageUrl : '/icon.jpeg'}
                  backgroundSize='cover'
                  border='1px gray.400'
                  borderRadius='md'
                />
                <Heading size='lg'>{firstHatName}</Heading>
              </HStack>
              <Stack spacing={1} align='end'>
                <Text size='sm'>
                  {hatIdDecimalToIp(hatIdHexToDecimal(firstHat.id))} on{' '}
                  {chainsMap(chainId)?.name}
                </Text>
                <Text size='sm'>{formatAddress(get(signerSafe, 'safe'))}</Text>
              </Stack>
            </Flex>

            <Flex justify='space-between'>
              <Stack w='48%'>
                <Heading size='md'>Balances</Heading>

                {map(filteredSafeTokens, (token: any) => (
                  <Text key={token.address}>
                    {round(
                      // add formatRoundedUnits util
                      toNumber(
                        formatUnits(
                          token.balance,
                          get(token, 'token.decimals') || 18,
                        ),
                      ),
                      2,
                    )}{' '}
                    {get(
                      token,
                      'token.symbol',
                      get(NETWORK_CURRENCY, chainId || 1),
                    )}
                  </Text>
                ))}
              </Stack>

              <Stack w='48%'>
                <Flex justify='space-between' h='2rem'>
                  <Heading size='sm'>Last In</Heading>
                  {lastInbound ? (
                    <Text>
                      {formatUnits(
                        BigInt(
                          get(
                            first(get(lastInbound, 'transfers')),
                            'value',
                            '0',
                          ),
                        ),
                        get(
                          first(get(lastInbound, 'transfers')),
                          'tokenInfo.decimals',
                        ) || 18,
                      )}{' '}
                      {get(
                        first(get(lastInbound, 'transfers')),
                        'tokenInfo.symbol',
                      ) || NETWORK_CURRENCY[chainId || 1]}
                    </Text>
                  ) : (
                    <Text>No inbound transactions</Text>
                  )}
                </Flex>

                <Flex justify='space-between' h='2rem'>
                  <Heading size='sm'>Last Out</Heading>
                  {lastOutbound ? (
                    <Text>
                      {formatUnits(
                        BigInt(
                          get(
                            first(get(lastOutbound, 'transfers')),
                            'value',
                            '0',
                          ),
                        ),
                        get(
                          first(get(lastOutbound, 'transfers')),
                          'tokenInfo.decimals',
                        ) || 18,
                      )}{' '}
                      {get(
                        first(get(lastOutbound, 'transfers')),
                        'tokenInfo.symbol',
                      ) || NETWORK_CURRENCY[chainId || 1]}
                    </Text>
                  ) : (
                    <Text>No outbound transactions</Text>
                  )}
                </Flex>
              </Stack>
            </Flex>

            <Flex>
              <Accordion w='full' allowToggle>
                <AccordionItem border='none'>
                  <AccordionButton>
                    <Text>History</Text>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    <Stack>Events</Stack>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Flex>
          </Stack>
        </CardBody>
      </Card>
    </Skeleton>
  );
};

export default SafeCard;
