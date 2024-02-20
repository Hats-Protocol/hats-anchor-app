import {
  Card,
  Flex,
  Heading,
  HStack,
  Image as ChakraImage,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { networkImages } from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetailsField } from 'hats-hooks';
import { AppHat } from 'hats-types';
import _ from 'lodash';
import { useEffect, useState } from 'react';

import { ChakraNextLink } from '../atoms';

const MobileHatCard = ({ hat }: HatCardProps) => {
  const { data: hatDetails } = useHatDetailsField(_.get(hat, 'details'));
  const [imageLoaded, setImageLoaded] = useState(false);
  const image = _.get(hat, 'imageUrl');

  useEffect(() => {
    const img = new Image();
    if (!image) return;
    img.src = image;
    img.onload = () => setImageLoaded(true);
  }, [image]);

  const hatName =
    _.get(hatDetails, 'type') === '1.0'
      ? _.get(hatDetails, 'data.name')
      : _.get(hat, 'details');

  return (
    <ChakraNextLink
      href={`trees/${hat.chainId}/${Number(
        hatIdToTreeId(BigInt(hat.id)),
      )}?hatId=${hatIdDecimalToIp(BigInt(hat.id))}`}
      w='full'
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
              alt={`${hatName} image`}
              onLoad={() => setImageLoaded(true)}
            />
          </Skeleton>
          <Stack maxW='calc(100% - 72px - 16px)' gap={1} pt={1}>
            <Text size='sm' noOfLines={1}>
              {Number(hatIdToTreeId(BigInt(hat.id)))}
            </Text>
            <Heading as='h1' size='md' variant='medium' noOfLines={2}>
              {hatName}
            </Heading>
          </Stack>
        </HStack>
      </Card>
    </ChakraNextLink>
  );
};

export default MobileHatCard;

interface HatCardProps {
  hat: AppHat;
}
