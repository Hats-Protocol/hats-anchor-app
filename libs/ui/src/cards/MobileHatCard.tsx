import {
  Card,
  HStack,
  Image as ChakraImage,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { HatWithDepth } from 'hats-types';
import _ from 'lodash';
import { useEffect, useState } from 'react';

import { ChakraNextLink } from '../atoms';

const MobileHatCard = ({ hat }: HatCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const image = _.get(hat, 'imageUrl');

  useEffect(() => {
    const img = new Image();
    if (!image) return;
    img.src = image;
    img.onload = () => setImageLoaded(true);
  }, [image]);

  return (
    <ChakraNextLink
      href={`/trees/${hat.chainId}/${hatIdToTreeId(BigInt(hat.id))}/${hat.id}`}
      w='full'
      pl={hat?.depth || 0 * 2}
    >
      <Card overflow='hidden' w='full'>
        <HStack
          pr={4}
          border='1px solid'
          borderColor='gray.600'
          borderRadius={6}
          align='start'
        >
          <Skeleton h='72px' w='72px' minW='72px' isLoaded={imageLoaded}>
            <ChakraImage
              src={image || '/icon.jpeg'}
              objectFit='cover'
              bgPosition='center'
              h='72px'
              w='72px'
              borderRight='1px solid'
              borderColor='gray.600'
              borderLeftRadius={5}
              alt={`${hat.name} image`}
              onLoad={() => setImageLoaded(true)}
            />
          </Skeleton>
          <Stack maxW='calc(100% - 72px - 16px)' gap={1} pt={1}>
            <Text size='xs' noOfLines={1} fontWeight='medium'>
              {hat.id}
            </Text>
            <Text size='md' variant='medium' noOfLines={2} lineHeight={4}>
              {hat.name}
            </Text>
          </Stack>
        </HStack>
      </Card>
    </ChakraNextLink>
  );
};

export default MobileHatCard;

interface HatCardProps {
  hat: HatWithDepth;
}
