'use client';

import {
  AspectRatio,
  Badge,
  Box,
  Heading,
  HStack,
  Icon,
  Image,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { MUTABILITY, STATUS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { useClipboard, useMediaStyles, useToast } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { hatLink } from 'utils';
import { useAccount } from 'wagmi';

const Markdown = dynamic(() => import('ui').then((mod) => mod.Markdown));
const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);
const CopyHash = dynamic(() => import('icons').then((mod) => mod.CopyHash));

const Header = () => {
  const toast = useToast();
  const { address } = useAccount();
  const { chainId, selectedHat, selectedHatDetails } = useEligibility();
  const { onCopy } = useClipboard(selectedHat?.id as string, {
    toastData: { title: 'Successfully copied hat ID to clipboard' },
  });
  const { isMobile } = useMediaStyles();

  const { name, description } = _.pick(selectedHatDetails, [
    'name',
    'description',
  ]);

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const isCurrentWearer = _.includes(_.map(wearer, 'id'), selectedHat?.id);

  const levelAtLocalTree = selectedHat?.levelAtLocalTree || 0;
  const mutableStatus = selectedHat?.mutable
    ? MUTABILITY.MUTABLE
    : MUTABILITY.IMMUTABLE;
  const activeStatus = selectedHat?.status ? STATUS.ACTIVE : STATUS.INACTIVE;

  return (
    <>
      {/* MOBILE */}
      <Stack
        display={{ base: 'flex', md: 'none' }}
        background='linear-gradient(180deg, rgba(247, 250, 252, 0.00) 0%, #F7FAFC 34.5%)'
        pb={2}
      >
        <Box width='100%'>
          {/* <Skeleton minH='450px' isLoaded={!isHatDetailsLoading}> */}
          <Image
            src={_.get(selectedHat, 'imageUrl') || '/icon.jpeg'}
            alt='Hat image'
            background='white'
            objectFit='cover'
            width='100%'
            height='auto'
          />
          {/* </Skeleton> */}
          {/* <Skeleton isLoaded={!isHatDetailsLoading}> */}
          <HStack mt={-2} pl={4}>
            {isCurrentWearer && <Badge colorScheme='green'>My Hat</Badge>}
            <Badge
              colorScheme={
                mutableStatus === MUTABILITY.MUTABLE ? 'blue' : 'red'
              }
            >
              {mutableStatus}
            </Badge>
            <Badge
              colorScheme={activeStatus === STATUS.ACTIVE ? 'green' : 'red'}
            >
              {activeStatus}
            </Badge>
            <Badge>Level {levelAtLocalTree}</Badge>
          </HStack>
          {/* </Skeleton> */}
        </Box>
        <Stack w='full' px={4}>
          <HStack
            justify='space-between'
            gap={2}
            w='full'
            alignItems='baseline'
          >
            <Tooltip label={name || selectedHat?.details}>
              <Heading noOfLines={{ base: 2, md: 1 }}>
                {name || selectedHat?.details}
              </Heading>
            </Tooltip>

            <HStack>
              <Text color='blue.500' fontSize='xs'>
                {hatIdDecimalToIp(BigInt(selectedHat?.id || 0))}
              </Text>
              <Icon
                as={CopyHash}
                color='blue.500'
                cursor='pointer'
                h='12px'
                onClick={() => {
                  onCopy();
                  toast.info({
                    title: 'Successfully copied hat ID to clipboard',
                  });
                }}
              />
            </HStack>
          </HStack>
          {description && (
            <Markdown smallFont collapse maxHeight={70}>
              {description}
            </Markdown>
          )}
        </Stack>
      </Stack>

      {/* DESKTOP */}
      <HStack
        display={{ base: 'none', md: 'flex' }}
        w={{ base: '100%', md: '2xl' }}
        h={{ md: '120px' }}
        gap={10}
      >
        <AspectRatio
          ratio={1}
          boxSize='120px'
          display={{ base: 'none', md: 'block' }}
        >
          <ChakraNextLink
            href={hatLink({ chainId, hatId: selectedHat?.id, isMobile })}
            isExternal
          >
            <Image
              src={selectedHat?.imageUrl || '/icon.jpeg'}
              alt='hat image'
              loading='lazy'
              objectFit='cover'
              width='100%'
              border='1px solid'
              borderColor='gray.700'
              borderRadius='md'
              bg='white'
            />
          </ChakraNextLink>
        </AspectRatio>

        <Stack spacing={1} w={{ base: '100%', md: '80%' }}>
          <Stack w='full' gap={1}>
            <HStack
              justifyContent='space-between'
              lineHeight={6}
              wrap={{ base: 'wrap', md: 'unset' }}
            >
              <Skeleton isLoaded={!!selectedHatDetails} maxW='350px'>
                <Tooltip label={name || selectedHat?.details}>
                  <Heading
                    size='2xl'
                    variant='medium'
                    noOfLines={{ base: 2, md: 1 }}
                  >
                    {name || selectedHat?.details}
                  </Heading>
                </Tooltip>
              </Skeleton>

              <HStack>
                <Text whiteSpace='nowrap'>Hat ID:</Text>
                <Skeleton
                  as={HStack}
                  isLoaded={!!selectedHat?.id}
                  cursor={selectedHat ? 'pointer' : 'default'}
                  onClick={onCopy}
                >
                  <Text color='blue.500'>
                    {hatIdDecimalToIp(BigInt(selectedHat?.id || 0))}
                  </Text>
                  <Icon as={CopyHash} color='blue.500' />
                </Skeleton>
              </HStack>
            </HStack>
            {description && (
              <Box opacity={0.6}>
                <Markdown>{description}</Markdown>
              </Box>
            )}
          </Stack>
          <Skeleton isLoaded={!!selectedHat}>
            <HStack>
              {isCurrentWearer && <Badge colorScheme='green'>My Hat</Badge>}
              <Badge
                colorScheme={
                  mutableStatus === MUTABILITY.MUTABLE ? 'blue' : 'red'
                }
              >
                {mutableStatus}
              </Badge>
              <Badge
                colorScheme={activeStatus === STATUS.ACTIVE ? 'green' : 'red'}
              >
                {activeStatus}
              </Badge>
              <Badge colorScheme='purple'>Level {levelAtLocalTree}</Badge>
            </HStack>
          </Skeleton>
        </Stack>
      </HStack>
    </>
  );
};

export default Header;
