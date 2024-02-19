import {
  Badge,
  Box,
  Heading,
  HStack,
  Icon,
  Image,
  Stack,
  Text,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react';
import { MUTABILITY, STATUS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useToast } from 'app-hooks';
import { useTreeForm } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { FaCopy } from 'react-icons/fa';
import { useAccount } from 'wagmi';

const Markdown = dynamic(() => import('ui').then((mod) => mod.Markdown));

const Header = () => {
  const toast = useToast();
  const { address } = useAccount();
  const { chainId, selectedHat, selectedHatDetails, editMode } = useTreeForm();
  const { onCopy } = useClipboard(selectedHat?.id || '');

  const { name, description } = _.pick(selectedHatDetails, [
    'name',
    'description',
  ]);

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
  const activeStatus = selectedHat?.status ? STATUS.ACTIVE : STATUS.INACTIVE;

  return (
    <Stack spacing={4}>
      <HStack align='start' justify='space-between' alignItems='center' gap={4}>
        <Image
          loading='lazy'
          src={_.get(selectedHat, 'imageUrl') || '/icon.jpeg'}
          alt='hat image'
          background='white'
          objectFit='cover'
          h='100px'
          borderRadius='md'
          border='1px solid #E2E8F0'
        />
        <Stack w='full' spacing={1}>
          <Stack justifyContent='space-between'>
            <Tooltip label={name || selectedHat?.details}>
              <Heading isTruncated>{name || selectedHat?.details}</Heading>
            </Tooltip>
            {selectedHat?.id && (
              <HStack>
                <Text color='blue.500'>
                  {hatIdDecimalToIp(BigInt(selectedHat.id))}
                </Text>
                <Icon
                  as={FaCopy}
                  color='blue.500'
                  cursor='pointer'
                  onClick={() => {
                    onCopy();
                    toast.info({
                      title: 'Successfully copied hat ID to clipboard',
                    });
                  }}
                />
              </HStack>
            )}
          </Stack>
        </Stack>
      </HStack>
      {description && (
        <Box color='blackAlpha.800'>
          <Markdown>{description}</Markdown>
        </Box>
      )}
      <HStack justifyContent='center'>
        {isCurrentWearer && <Badge colorScheme='green'>My Hat</Badge>}
        <Badge
          colorScheme={mutableStatus === MUTABILITY.MUTABLE ? 'blue' : 'red'}
        >
          {mutableStatus}
        </Badge>
        <Badge colorScheme={activeStatus === STATUS.ACTIVE ? 'green' : 'red'}>
          {activeStatus}
        </Badge>
        <Badge>Level {levelAtLocalTree}</Badge>
      </HStack>
    </Stack>
  );
};

export default Header;
