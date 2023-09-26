import {
  Card,
  CardBody,
  Heading,
  HStack,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import useHatDetailsField from '@/hooks/useHatDetailsField';
import { chainsMap } from '@/lib/web3';
import { IHat } from '@/types';

const DashboardHatCard = ({ hat }: HatCardProps) => {
  const { data: hatDetailsFieldData } = useHatDetailsField(
    _.get(hat, 'details'),
  );

  const hatName =
    _.get(hatDetailsFieldData, 'type') === '1.0'
      ? _.get(hatDetailsFieldData, 'data.name')
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
              <Heading as='h1' size='md' fontWeight='medium' noOfLines={1}>
                {hatName}
              </Heading>
              <HStack>
                <Text fontSize='xs'>
                  Tree ID: {Number(hatIdToTreeId(BigInt(hat.id)))}
                </Text>
                <Text fontSize='xs'>
                  Chain ID: {chainsMap(hat.chainId).name}
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
  hat: IHat;
}
