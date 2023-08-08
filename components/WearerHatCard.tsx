import { Box, Card, Flex, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import useHatDetails from '@/hooks/useHatDetails';
import useHatDetailsField from '@/hooks/useHatDetailsField';
import { getTreeId } from '@/lib/hats';
import { IHat } from '@/types';

const WearerHatCard = ({ hat }: { hat: IHat }) => {
  const { data: hatDetailsFieldData, schemaType: schemaTypeDetailsField } =
    useHatDetailsField(_.get(hat, 'details'));

  const { data: topHat } = useHatDetails({
    hatId: getTreeId(_.get(hat, 'id'), true),
    chainId: _.get(hat, 'chainId'),
  });
  const {
    data: topHatDetailsFieldData,
    schemaType: topHatSchemaTypeDetailsField,
  } = useHatDetailsField(_.get(topHat, 'details'));

  const hatName =
    schemaTypeDetailsField === '1.0'
      ? _.get(hatDetailsFieldData, 'name')
      : _.get(hat, 'details');

  const topHatName =
    topHatSchemaTypeDetailsField === '1.0'
      ? _.get(topHatDetailsFieldData, 'name')
      : _.get(topHat, 'details');

  return (
    <ChakraNextLink
      href={`/trees/${_.get(hat, 'chainId')}/${Number(
        hatIdToTreeId(BigInt(_.get(hat, 'id'))),
      )}?hatId=${hatIdDecimalToIp(BigInt(_.get(hat, 'id')))}`}
    >
      <Card
        key={_.get(hat, 'id')}
        overflow='hidden'
        border='2px solid'
        borderColor='gray.600'
      >
        <Box
          bgImage={_.get(hat, 'imageUrl') || '/icon.jpeg'}
          bgSize='cover'
          bgPosition='center'
          w='110%'
          ml={-3}
          mt={-1}
          h='250px'
          border='1px solid'
          borderColor='gray.200'
        />
        <Box
          borderY='1px solid'
          borderColor='gray.600'
          p={2}
          mt={-1}
          bg='white'
        >
          <Flex justify='space-between'>
            <Text fontSize='xs' mr={2} fontWeight={600}>
              {topHatName}
            </Text>
            <Text fontSize='xs' color='gray.500'>
              {hatIdDecimalToIp(BigInt(_.get(hat, 'id')))}
            </Text>
          </Flex>

          <Text as='b' noOfLines={1}>
            {hatName}
          </Text>
        </Box>
      </Card>
    </ChakraNextLink>
  );
};

export default WearerHatCard;
