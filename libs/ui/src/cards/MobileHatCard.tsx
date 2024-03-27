import {
  Card,
  HStack,
  Icon,
  Image as ChakraImage,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetailsField } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { BsPersonBadge } from 'react-icons/bs';
import { HatWithDepth, SupportedChains } from 'types';
import { paddingForMaxDepth } from 'utils';

import { ChakraNextLink } from '../atoms';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const MobileHatCard = ({
  hat,
  chainId,
  isWearing,
  ensName,
  maxDepth,
}: HatCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const image = _.get(hat, 'imageUrl');

  useEffect(() => {
    const img = new Image();
    if (!image) return;
    img.src = image;
    img.onload = () => setImageLoaded(true);
  }, [image]);

  const { data: hatDetails } = useHatDetailsField(
    _.get(hat, 'name') ? undefined : _.get(hat, 'details'), // don't attempt to lookup if name already found for hat
  );
  const detailsName = _.get(
    hatDetails,
    'data.name',
    _.get(hat, 'name', _.get(hat, 'details')),
  );

  // trying to match the right value in `VerticalDividers` (4), 3 seems to be best here
  const padding = maxDepth
    ? ((_.get(hat, 'depth') || 0) * paddingForMaxDepth(maxDepth) || 2) - 3
    : undefined;
  if (!_.get(hat, 'id')) return null;

  return (
    <ChakraNextLink
      display='block'
      href={`/trees/${chainId || hat.chainId}/${hatIdToTreeId(
        BigInt(hat.id),
      )}/${hatIdDecimalToIp(BigInt(hat.id))}`}
      // don't adjust top hat (or hat used throughout the app) width
      w={!maxDepth || hat?.depth === 0 ? '100%' : `calc(100% - ${padding}px)`} // subtract left margin from card width
    >
      <Card
        overflow='hidden'
        boxShadow='md'
        border='1px solid'
        borderColor='gray.600'
        borderRadius={6}
      >
        <HStack align='start' position='relative'>
          <Skeleton boxSize='72px' minW='72px' isLoaded={imageLoaded}>
            <ChakraImage
              src={image || '/icon.jpeg'}
              objectFit='cover'
              bgPosition='center'
              boxSize='72px'
              borderRight='1px solid'
              borderColor='gray.600'
              borderLeftRadius={5}
              alt={`${detailsName} image`}
              onLoad={() => setImageLoaded(true)}
            />
          </Skeleton>

          <Stack gap={1} pt={1} w='70%' overflow='hidden'>
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
          <HStack
            borderTop='1px solid'
            borderColor='gray.600'
            p={1}
            bg='green.50'
          >
            <Icon as={BsPersonBadge} w={4} h={4} />
            <Text>{ensName || 'You are wearing this hat'}</Text>
          </HStack>
        )}
      </Card>
    </ChakraNextLink>
  );
};

export default MobileHatCard;

interface HatCardProps {
  hat: HatWithDepth;
  chainId?: SupportedChains;
  isWearing?: boolean;
  ensName?: string | null;
  maxDepth?: number;
}
