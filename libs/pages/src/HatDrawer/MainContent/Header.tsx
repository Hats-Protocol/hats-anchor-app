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
  Stack,
  Tooltip,
} from '@chakra-ui/react';
import { MUTABILITY, STATUS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useHatStatus, useWearerDetails } from 'hats-hooks';
import { useClipboard, useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';

const Markdown = dynamic(() => import('ui').then((mod) => mod.Markdown));
const CopyHash = dynamic(() => import('icons').then((mod) => mod.CopyHash));

const Header = () => {
  const { address } = useAccount();
  const { chainId, editMode, treeToDisplay } = useTreeForm();
  const { selectedHat, selectedHatDetails } = useSelectedHat();

  const { onCopy: copyHatId } = useClipboard(selectedHat?.id || '', {
    toastData: {
      title: 'Successfully copied hat ID to clipboard',
      status: 'info',
    },
  });
  const { isMobile } = useMediaStyles();

  const { name, description } = _.pick(selectedHatDetails, [
    'name',
    'description',
  ]);
  const imageUrl = _.get(
    _.find(treeToDisplay, { id: selectedHat?.id }),
    'imageUrl',
  );

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
    editMode,
  });
  const isCurrentWearer = _.includes(_.map(wearer, 'id'), selectedHat?.id);

  const levelAtLocalTree = selectedHat?.levelAtLocalTree || 0;
  const mutableStatus = selectedHat?.mutable
    ? MUTABILITY.MUTABLE
    : MUTABILITY.IMMUTABLE;

  const { data: hatStatus } = useHatStatus({
    selectedHat,
    chainId,
  });
  const activeStatus =
    selectedHat?.status && hatStatus ? STATUS.ACTIVE : STATUS.INACTIVE;

  if (!selectedHat) return null;

  return (
    <Stack
      spacing={4}
      px={{ base: 4, md: 16 }}
      pb={4}
      bg={{ base: 'white', md: 'transparent' }}
    >
      <Stack gap={1} w='100%'>
        <HStack
          spacing={4}
          minH={{ base: '150px', md: 'auto' }}
          pt={{ md: '50px' }}
          align='end'
          w='100%'
        >
          {isMobile && (
            <Box
              boxSize='120px'
              borderRadius='md'
              overflow='hidden'
              objectFit='contain'
              border='1px solid'
              borderColor='blackAlpha.200'
            >
              <Image
                loading='lazy'
                src={
                  (editMode && imageUrl) ||
                  _.get(selectedHat, 'imageUrl') ||
                  '/icon.jpeg'
                }
                alt='hat image'
                background='white'
                objectFit='cover'
                boxSize='122px'
              />
            </Box>
          )}

          <Flex
            justify='space-between'
            gap={2}
            direction={{ base: 'column', md: 'row' }}
            w='100%'
            maxW={{ base: '60%', md: '100%' }}
          >
            <Tooltip label={name || selectedHat?.details}>
              <Heading noOfLines={{ base: 2, md: 1 }}>
                {name || selectedHat?.details}
              </Heading>
            </Tooltip>

            <Box>
              <Button
                size='xs'
                variant='ghost'
                colorScheme='blue'
                onClick={copyHatId}
                rightIcon={
                  <Icon as={CopyHash} color='blue.500' cursor='pointer' />
                }
              >
                #{hatIdDecimalToIp(BigInt(selectedHat?.id || 0))}
              </Button>
            </Box>
          </Flex>
        </HStack>
        {description && (
          <Box opacity={0.6}>
            <Markdown>{description}</Markdown>
          </Box>
        )}
      </Stack>

      <Flex justify={isMobile ? 'center' : 'start'}>
        <HStack>
          {isCurrentWearer && <Badge colorScheme='green'>My Hat</Badge>}
          <Badge
            colorScheme={
              mutableStatus === MUTABILITY.MUTABLE || levelAtLocalTree === 0
                ? 'blue'
                : 'red'
            }
          >
            {levelAtLocalTree === 0 ? 'Top Hat' : mutableStatus}
          </Badge>
          {levelAtLocalTree > 0 && (
            <>
              <Badge
                colorScheme={activeStatus === STATUS.ACTIVE ? 'green' : 'red'}
              >
                {activeStatus}
              </Badge>
              <Badge>Level {levelAtLocalTree}</Badge>
            </>
          )}
        </HStack>
      </Flex>
    </Stack>
  );
};

export default Header;
