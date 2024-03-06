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
import { HatWithDepth, SupportedChains } from 'types';
import { HatIcon } from 'icons';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { BsPersonBadge } from 'react-icons/bs';

import { ChakraNextLink } from '../atoms';

const MobileHatCard = ({ hat, chainId, isWearing, ensName }: HatCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const image = _.get(hat, 'imageUrl');

  useEffect(() => {
    const img = new Image();
    if (!image) return;
    img.src = image;
    img.onload = () => setImageLoaded(true);
  }, [image]);

  const { data: hatDetails } = useHatDetailsField(
    !hat.name ? hat.details : undefined, // don't attempt to lookup if name already found for hat
  );
  const detailsName = _.get(hatDetails, 'data.name', hat.name);

  return (
    <ChakraNextLink
      href={`/trees/${chainId || hat.chainId}/${hatIdToTreeId(
        BigInt(hat.id),
      )}/${hatIdDecimalToIp(BigInt(hat.id))}`}
      w='full'
      pl={(hat?.depth || 0) * 2}
    >
      <Card
        overflow='hidden'
        w='full'
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
          <Stack maxW='calc(100% - 72px - 16px)' gap={1} pt={1} w='full'>
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
              alt='Hat'
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
}
