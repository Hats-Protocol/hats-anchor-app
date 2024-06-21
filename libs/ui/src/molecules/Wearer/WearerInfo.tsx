'use client';
import {
  Avatar,
  Heading,
  HStack,
  IconButton,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { useWearerDetails } from 'hats-hooks';
import { useClipboard } from 'hooks';
import _ from 'lodash';
import { usePathname } from 'next/navigation';
import { createIcon } from 'opepen-standard';
import { useMemo } from 'react';
import { FiCopy } from 'react-icons/fi';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useEnsAvatar, useEnsName } from 'wagmi';

const WearerInfo = () => {
  const pathname = usePathname();
  const parsedPathname = pathname.split('/');
  const wearerAddress = _.get(
    parsedPathname,
    _.subtract(_.size(parsedPathname), 1),
  ) as Hex;

  const { data: currentHats, isLoading: wearerLoading } = useWearerDetails({
    wearerAddress,
    chainId: 'all',
  });
  const { onCopy } = useClipboard(wearerAddress, {
    toastData: {
      title: 'Successfully copied wearer address to clipboard',
    },
  });

  const firstCreated = _.minBy(currentHats, 'createdAt');

  const { data: ensName } = useEnsName({
    address: wearerAddress,
    chainId: 1,
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName as string,
    chainId: 1,
  });

  const name = useMemo(() => {
    return ensName || formatAddress(wearerAddress);
  }, [ensName, wearerAddress]);

  const avatar = useMemo(() => {
    if (!wearerAddress || typeof window === 'undefined') return undefined;
    if (ensAvatar) return ensAvatar;
    return createIcon({
      seed: _.toLower(wearerAddress),
      size: 64,
    }).toDataURL();
  }, [wearerAddress, ensAvatar]);

  return (
    <HStack spacing={6} pl={6}>
      {avatar && (
        <Avatar src={avatar} height='100px' w='75px' borderRadius='md' />
      )}

      <Stack>
        <HStack>
          <Heading size='lg' variant='medium'>
            {name}
          </Heading>

          <IconButton
            variant='ghost'
            icon={<FiCopy />}
            size='sm'
            onClick={onCopy}
            aria-label='Copy Address'
            color='gray.500'
          />
        </HStack>
        <Skeleton isLoaded={!wearerLoading}>
          {!!_.get(firstCreated, 'createdAt') && (
            <Text>
              Hat wearer since:{' '}
              {_.get(firstCreated, 'createdAt') &&
                format(
                  Number(_.get(firstCreated, 'createdAt')) * 1000,
                  'MMMM yyyy',
                )}
            </Text>
          )}
        </Skeleton>
      </Stack>
    </HStack>
  );
};

export default WearerInfo;
