import {
  Box,
  Card,
  CardBody,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import _ from 'lodash';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import useHatDetailsField from '@/hooks/useHatDetailsField';
import { getTreeId, prettyIdToIp } from '@/lib/hats';
import { chainsMap } from '@/lib/web3';
import { IHat } from '@/types';

const HatCard = ({ hat }: HatCardProps) => {
  const { data: hatDetailsFieldData, schemaType: schemaTypeDetailsField } =
    useHatDetailsField(_.get(hat, 'details'));

  const hatName =
    schemaTypeDetailsField === '1.0'
      ? _.get(hatDetailsFieldData, 'name')
      : _.get(hat, 'details');

  return (
    <ChakraNextLink
      href={`trees/${hat.chainId}/${Number(
        getTreeId(hat.prettyId),
      )}?hatId=${prettyIdToIp(hat.prettyId)}`}
    >
      <Card h='100px' overflow='hidden'>
        <CardBody p={4}>
          <HStack spacing={4}>
            <Box
              bgImage={
                _.get(hat, 'imageUrl') ? _.get(hat, 'imageUrl') : '/icon.jpeg'
              }
              bgSize='cover'
              bgPosition='center'
              h='72px'
              w='72px'
              borderRadius={4}
              border='2px solid'
              borderColor='gray.600'
            />
            <Stack maxW='75%'>
              <Heading as='h1' size='md' fontWeight={500} noOfLines={1}>
                {hatName}
              </Heading>
              <HStack>
                <Text fontSize='xs'>
                  Tree ID: {Number(getTreeId(hat.prettyId))}
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

export default HatCard;

interface HatCardProps {
  hat: IHat;
}
