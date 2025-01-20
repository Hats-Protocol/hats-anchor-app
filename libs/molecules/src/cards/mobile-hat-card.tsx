'use client';

import { Card, HStack, Icon, Skeleton, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetailsField } from 'hats-hooks';
import { get } from 'lodash';
import dynamic from 'next/dynamic';
import { BsPersonBadge } from 'react-icons/bs';
import { HatWithDepth, SupportedChains } from 'types';
import { cn, LazyImage, Link } from 'ui';
import { paddingForMaxDepth } from 'utils';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const MobileHatCard = ({ hat, chainId, isWearing, ensName, maxDepth }: HatCardProps) => {
  const { data: hatDetails } = useHatDetailsField(
    get(hat, 'name') ? undefined : get(hat, 'details'), // don't attempt to lookup if name already found for hat
  );
  const detailsName = get(hatDetails, 'data.name', get(hat, 'name', get(hat, 'details')));

  // trying to match the right value in `VerticalDividers` (4), 3 seems to be best here
  const padding = maxDepth ? (get(hat, 'depth', 0) - 1) * paddingForMaxDepth(maxDepth) + 1 : undefined;
  if (!get(hat, 'id')) return null;

  return (
    <Link
      href={`/trees/${chainId || hat.chainId}/${hatIdToTreeId(BigInt(hat.id))}/${hatIdDecimalToIp(BigInt(hat.id))}`}
      // don't adjust top hat (or hat used throughout the app) width
      className={cn('block', `${!maxDepth || (hat?.depth || 0) <= 1 ? 'w-full' : `calc(100% - ${padding}px)`}`)} // subtract left margin from card width
    >
      <Skeleton isLoaded={!!hat.details} w='full' h='100%'>
        <Card overflow='hidden' boxShadow='md' border='1px solid' borderColor='gray.600' borderRadius={6} h='72px'>
          <HStack align='start' position='relative'>
            <LazyImage
              src={get(hat, 'imageUrl')}
              alt={`${detailsName} image`}
              objectFit='cover'
              bgPosition='center'
              boxSize={72}
              skeletonClassName='absolute top-[-2px] left-[-2px]'
            />

            <Stack gap={1} pt={1} pl='78px'>
              <Text size='xs' noOfLines={1} fontWeight='medium'>
                {hatIdDecimalToIp(BigInt(hat.id))}
              </Text>
              <Text size='md' variant='medium' noOfLines={2} lineHeight={5}>
                {detailsName}
              </Text>
            </Stack>

            {isWearing && (
              <Icon
                as={HatIcon}
                // alt='Hat'
                boxSize={4}
                color='green'
                position='absolute'
                top={2}
                right={2}
              />
            )}
          </HStack>
          {isWearing && (
            <HStack borderTop='1px solid' borderColor='gray.600' p={1} bg='green.50'>
              <Icon as={BsPersonBadge} w={4} h={4} />
              <Text>{ensName || 'You are wearing this hat'}</Text>
            </HStack>
          )}
        </Card>
      </Skeleton>
    </Link>
  );
};

interface HatCardProps {
  hat: HatWithDepth;
  chainId?: SupportedChains;
  isWearing?: boolean;
  ensName?: string | null;
  maxDepth?: number;
}

export { MobileHatCard };
