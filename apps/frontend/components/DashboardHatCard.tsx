import {
  Card,
  CardBody,
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
import { ChakraNextLink } from 'ui';

const DashboardHatCard = ({ hat }: HatCardProps) => {
  const { data: hatDetails } = useHatDetailsField(_.get(hat, 'details'));
  const [imageLoaded, setImageLoaded] = useState(false);
  const image = _.get(hat, 'imageUrl');

  useEffect(() => {
    const img = new Image();
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
    >
      <Card h='100px' overflow='hidden'>
        <CardBody p={4}>
          <HStack spacing={4}>
            <Skeleton
              h='72px'
              w='72px'
              minW='72px'
              borderRadius={4}
              isLoaded={imageLoaded}
            >
              <ChakraImage
                src={image || '/icon.jpeg'}
                objectFit='cover'
                bgPosition='center'
                h='72px'
                w='72px'
                borderRadius={4}
                border='2px solid'
                borderColor='gray.600'
                alt={`${hatName} image`}
                onLoad={() => setImageLoaded(true)}
              />
            </Skeleton>
            <Stack maxW='calc(100% - 72px - 16px)'>
              <Tooltip label={hatName} placement='top'>
                <Heading as='h1' size='md' variant='medium' noOfLines={1}>
                  {hatName}
                </Heading>
              </Tooltip>
              <HStack spacing={4}>
                <Flex
                  boxSize='30px'
                  p={1}
                  bg='blackAlpha.100'
                  borderRadius='md'
                >
                  <ChakraImage src={networkImages[hat.chainId]} />
                </Flex>
                <Text fontSize='md' fontWeight={600} noOfLines={1}>
                  #{Number(hatIdToTreeId(BigInt(hat.id)))}
                </Text>
              </HStack>
            </Stack>
          </HStack>
        </CardBody>
      </Card>
    </ChakraNextLink>
  );
};

export default DashboardHatCard;

interface HatCardProps {
  hat: AppHat;
}
