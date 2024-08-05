import {
  // Accordion,
  // AccordionButton,
  // AccordionIcon,
  // AccordionItem,
  // AccordionPanel,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import {
  NETWORK_CURRENCY,
  NETWORK_CURRENCY_IMAGE,
} from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { SafeInfoResponse } from '@safe-global/api-kit';
import { useHatDetails } from 'hats-hooks';
import { formHatUrl, safeUrl } from 'hats-utils';
import {
  useSafeTokens,
  useSafeTransactions,
  useSuperfluidStreams,
} from 'hooks';
import {
  every,
  filter,
  first,
  get,
  includes,
  map,
  some,
  toLower,
} from 'lodash';
import Link from 'next/link';
import { createIcon } from 'opepen-standard';
import { useMemo } from 'react';
import { AppHat, HatSignerGate, SupportedChains } from 'types';
import { formatAddress, formatRoundedDecimals, ipfsUrl } from 'utils';
import { getAddress, Hex } from 'viem';
import { useEnsAvatar, useEnsName } from 'wagmi';

import ActiveStreams from './ActiveStreams';
import LastTransaction from './LastTransaction';

const EXCLUDE_TOKENS = ['0xB1c37407dC5f996fAbfC4Be599c966aD6DE50C68'];
const OVERRIDE_TOKEN_IMAGE = ['0x59988e47A3503AaFaA0368b9deF095c818Fdca01'];

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

  const { data: streams } = useSuperfluidStreams({
    addresses: [safeAddress],
    chainId,
  });
  const { data: ensName } = useEnsName({
    address: safeAddress,
    chainId: 1,
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName as string,
    chainId: 1,
  });

  const safeAvatar: string | undefined = useMemo(() => {
    if (!safeAddress) return undefined;
    return createIcon({
      seed: toLower(safeAddress),
      size: 64,
    }).toDataURL();
  }, [safeAddress]);

  if (!firstHat || !chainId) return null;

  return (
    <Skeleton isLoaded={!!get(signerSafe, 'safe')}>
      <Card w='100%'>
        <CardBody>
          <Stack spacing={4}>
            <Flex justify='space-between' gap={4}>
              <HStack>
                <Box
                  boxSize='50px'
                  backgroundImage={imageUrl !== '#' ? imageUrl : '/icon.jpeg'}
                  backgroundSize='cover'
                  border='1px gray.400'
                  borderRadius='md'
                />
                <Heading variant='medium' size='lg'>
                  {firstHatName}
                </Heading>
              </HStack>
            </Flex>

            <Flex>
              <Stack>
                <Heading variant='medium' size='sm'>
                  Assets
                </Heading>

                {map(filteredSafeTokens, (token: any) => {
                  const localTokenImage = !includes(
                    OVERRIDE_TOKEN_IMAGE,
                    get(token, 'tokenAddress'),
                  )
                    ? get(token, 'token.logoUri')
                    : undefined;

                  return (
                    <HStack key={token.address}>
                      <Heading size='xl'>
                        {formatRoundedDecimals({
                          value: token.balance,
                          decimals: get(token, 'token.decimals'),
                        })}
                      </Heading>
                      <HStack spacing={1}>
                        <Image
                          src={
                            localTokenImage || NETWORK_CURRENCY_IMAGE[chainId]
                          }
                          boxSize={4}
                          alt='token image'
                        />
                        <Text size='sm'>
                          {get(
                            token,
                            'token.symbol',
                            get(NETWORK_CURRENCY, chainId || 1),
                          )}
                        </Text>
                      </HStack>
                    </HStack>
                  );
                })}
              </Stack>
            </Flex>

            <Divider w='70%' mx='auto' />

            <ActiveStreams streams={streams} />

            <Flex justify='space-between'>
              <LastTransaction type={'inbound'} transaction={lastInbound} />

              <LastTransaction type={'outbound'} transaction={lastOutbound} />
            </Flex>

            <Flex justify='space-between' align='center'>
              <Link
                href={safeUrl(
                  chainId as SupportedChains,
                  get(signerSafe, 'safe'),
                )}
              >
                <Button variant='ghost' p={0} m={0}>
                  <HStack>
                    <Box
                      height='26px'
                      width='16px'
                      overflow='hidden'
                      backgroundImage={ensAvatar || safeAvatar}
                      backgroundSize='cover'
                      backgroundClip='content-box'
                      backgroundPosition='center'
                      borderRadius='sm'
                    />
                    <Text size='sm' fontWeight={400}>
                      {ensName || formatAddress(get(signerSafe, 'safe'))}
                    </Text>
                  </HStack>
                </Button>
              </Link>

              <Link
                href={formHatUrl({
                  chainId: chainId as SupportedChains,
                  hatId: firstHat.id,
                })}
              >
                <Button variant='ghost' p={0} m={0}>
                  <Text size='sm' fontWeight={400}>
                    #{hatIdDecimalToIp(hatIdHexToDecimal(firstHat.id))}
                  </Text>
                </Button>
              </Link>
            </Flex>

            {/* <Flex>
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
            </Flex> */}
          </Stack>
        </CardBody>
      </Card>
    </Skeleton>
  );
};

export default SafeCard;
