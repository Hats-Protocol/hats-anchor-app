import {
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Image,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { networkImages } from 'app-constants';
import { useHatDetailsField } from 'hats-hooks';
import { AppHat } from 'hats-types';
import _ from 'lodash';

import ChakraNextLink from './atoms/ChakraNextLink';

const DashboardHatCard = ({ hat }: HatCardProps) => {
  const { data: hatDetails } = useHatDetailsField(_.get(hat, 'details'));

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
            <Image
              src={_.get(hat, 'imageUrl') || '/icon.jpeg'}
              bgSize='cover'
              bgPosition='center'
              h='72px'
              w='72px'
              borderRadius={4}
              border='2px solid'
              borderColor='gray.600'
              alt={`${hatName} image`}
            />
            <Stack maxW='75%'>
              <Tooltip label={hatName} placement='top'>
                <Heading as='h1' size='md' fontWeight='medium' noOfLines={1}>
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
                  <Image src={networkImages[hat.chainId]} />
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
