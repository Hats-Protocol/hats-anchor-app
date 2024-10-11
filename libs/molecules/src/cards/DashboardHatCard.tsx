'use client';

import {
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Image as ChakraImage,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { NETWORK_IMAGES } from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useMediaStyles } from 'hooks';
import { get } from 'lodash';
import { AppHat } from 'types';
import { ChakraNextLink, LazyImage } from 'ui';
import { ipfsUrl } from 'utils';

const DashboardHatCard = ({ hat }: HatCardProps) => {
  const { isMobile } = useMediaStyles();

  const image = get(hat, 'imageUri')
    ? ipfsUrl(get(hat, 'imageUri'))
    : undefined;
  const hatRawDetails = get(hat, 'detailsMetadata');
  const hatDetails = hatRawDetails
    ? get(JSON.parse(hatRawDetails), 'data')
    : undefined;

  const hatLink = isMobile
    ? `trees/${hat.chainId}/${Number(
        hatIdToTreeId(BigInt(hat.id)),
      )}/${hatIdDecimalToIp(BigInt(hat.id))}`
    : `trees/${hat.chainId}/${Number(
        hatIdToTreeId(BigInt(hat.id)),
      )}?hatId=${hatIdDecimalToIp(BigInt(hat.id))}`;

  return (
    <ChakraNextLink href={hatLink}>
      <Card h='100px' overflow='hidden'>
        <CardBody p={4}>
          <HStack spacing={4}>
            <LazyImage
              src={image || '/icon.jpeg'}
              alt={`${get(hatDetails, 'name', get(hat, 'details'))} image`}
              boxSize={72}
            />

            <Stack maxW='calc(100% - 72px - 16px)'>
              <Tooltip
                label={get(hatDetails, 'name', get(hat, 'details'))}
                placement='top'
              >
                <Heading as='h1' size='md' variant='medium' noOfLines={1}>
                  {get(hatDetails, 'name', get(hat, 'details'))}
                </Heading>
              </Tooltip>
              <HStack spacing={4}>
                <Flex
                  boxSize='30px'
                  p={1}
                  bg='blackAlpha.100'
                  borderRadius='md'
                >
                  <ChakraImage src={NETWORK_IMAGES[hat.chainId || 1]} />
                </Flex>
                <Text size='md' variant='medium' noOfLines={1}>
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
