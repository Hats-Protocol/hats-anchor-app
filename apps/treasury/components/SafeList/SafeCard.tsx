'use client';

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
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { SafeInfoResponse } from '@safe-global/api-kit';
import { formHatUrl, safeUrl } from 'hats-utils';
import { get, toLower } from 'lodash';
import Link from 'next/link';
import { createIcon } from 'opepen-standard';
import { useMemo } from 'react';
import { AppHat, HatSignerGate, SupportedChains } from 'types';
import { formatAddress, ipfsUrl } from 'utils';
import { useEnsAvatar, useEnsName } from 'wagmi';

import ActiveStreams from './ActiveStreams';
import LastTransaction from './LastTransaction';
import SafeAssets from './SafeAssets';
import SafeTotal from './SafeTotal';

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

  const firstHat = get(hats, '[0]');
  const firstHatDetails = get(firstHat, 'detailsMetadata');
  const firstHatName = firstHatDetails
    ? get(JSON.parse(firstHatDetails), 'data.name')
    : get(firstHat, 'details');
  const imageUrl = ipfsUrl(get(firstHat, 'nearestImage'));

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
              <HStack maxW='80%'>
                <Box
                  boxSize='50px'
                  minW='50px'
                  backgroundImage={imageUrl !== '#' ? imageUrl : '/icon.jpeg'}
                  backgroundSize='cover'
                  border='1px gray.400'
                  borderRadius='md'
                />
                <Heading variant='medium' size='lg' noOfLines={2}>
                  {firstHatName}
                </Heading>
              </HStack>

              <SafeTotal safeAddress={safeAddress} />
            </Flex>

            <SafeAssets safeAddress={safeAddress} />

            <Divider w='70%' mx='auto' />

            <ActiveStreams safeAddress={safeAddress} />

            <Flex justify='space-between'>
              <LastTransaction safeAddress={safeAddress} type={'inbound'} />

              <LastTransaction safeAddress={safeAddress} type={'outbound'} />
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
