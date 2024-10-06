'use client';

import {
  Badge,
  Box,
  Button,
  Flex,
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
import { useClipboard } from 'hooks';
import { get, pick } from 'lodash';
import dynamic from 'next/dynamic';

const Markdown = dynamic(() => import('ui').then((mod) => mod.Markdown));
const CopyHash = dynamic(() => import('icons').then((mod) => mod.CopyHash));

const Header = () => {
  const { selectedHat, selectedHatDetails, isHatDetailsLoading } =
    useEligibility();
  const { onCopy } = useClipboard(selectedHat?.id as string, {
    toastData: { title: 'Successfully copied hat ID to clipboard' },
  });

  const { name, description } = pick(selectedHatDetails, [
    'name',
    'description',
  ]);

  const levelAtLocalTree = selectedHat?.levelAtLocalTree || 0;
  const mutableStatus = selectedHat?.mutable
    ? MUTABILITY.MUTABLE
    : MUTABILITY.IMMUTABLE;
  const activeStatus = selectedHat?.status ? STATUS.ACTIVE : STATUS.INACTIVE;

  // TODO use bg image

  return (
    <Stack pb={2} w='full'>
      <Box width='100%'>
        <Skeleton
          minH='250px'
          w={{ base: '100%', md: 'auto' }}
          borderRadius={{ base: 'none', md: 'lg' }}
          isLoaded={!isHatDetailsLoading}
        >
          <Image
            src={get(selectedHat, 'imageUrl') || '/icon.jpeg'}
            alt='Hat image'
            background='white'
            objectFit='cover'
            width='100%'
            height='auto'
            borderRadius={{ base: 'none', md: 'lg' }}
          />
        </Skeleton>

        <Flex mt={-2} px={4} justify='center'>
          <Skeleton isLoaded={!isHatDetailsLoading} h='40px'>
            <HStack>
              {/* {isCurrentWearer && <Badge colorScheme='green'>My Hat</Badge>} */}

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
          </Skeleton>
        </Flex>
      </Box>

      <Stack w='full' px={4}>
        <Flex w='full' justify='space-between' align='baseline'>
          <Tooltip label={name || selectedHat?.details}>
            <Skeleton
              isLoaded={!isHatDetailsLoading}
              h={8}
              minW='100px'
              borderRadius='sm'
            >
              <Heading noOfLines={{ base: 2, md: 1 }}>
                {name || selectedHat?.details || '-'}
              </Heading>
            </Skeleton>
          </Tooltip>

          <Skeleton isLoaded={!isHatDetailsLoading} minW='50px'>
            <Button
              variant='link'
              color='blue.500'
              onClick={onCopy}
              rightIcon={<Icon as={CopyHash} boxSize={4} />}
            >
              <Text>{hatIdDecimalToIp(BigInt(selectedHat?.id || 0))}</Text>
            </Button>
          </Skeleton>
        </Flex>

        {isHatDetailsLoading ? (
          <Skeleton noOfLines={3} w='full' borderRadius='md'>
            <Text>-</Text>
            <Text>-</Text>
            <Text>-</Text>
          </Skeleton>
        ) : (
          description && (
            <Box>
              <Markdown collapse maxHeight={70}>
                {description}
              </Markdown>
            </Box>
          )
        )}
      </Stack>
    </Stack>
  );
};

export default Header;
