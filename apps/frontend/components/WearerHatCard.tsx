import { Box, Card, Flex, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails, useHatDetailsField } from 'hats-hooks';
import { AppHat } from 'hats-types';
import { getTreeId } from 'hats-utils';
import _ from 'lodash';

import { useTreeForm } from '../contexts/TreeFormContext';
import ChakraNextLink from './atoms/ChakraNextLink';

// TODO optimize top hat fetch
const WearerHatCard = ({ hat }: { hat: AppHat }) => {
  const { data: hatDetails } = useHatDetailsField(_.get(hat, 'details'));
  const { chainId } = useTreeForm();

  // TODO need topHatId from hatId
  const { data: topHat } = useHatDetails({
    hatId: getTreeId(_.get(hat, 'id'), true),
    chainId,
  });
  const { data: topHatDetails } = useHatDetailsField(_.get(topHat, 'details'));

  const hatName =
    hatDetails?.type === '1.0'
      ? _.get(hatDetails, 'data.name')
      : _.get(hat, 'details');

  const topHatName =
    topHatDetails?.type === '1.0'
      ? _.get(topHatDetails, 'data.name')
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
            <Text fontSize='xs' mr={2} fontWeight='semibold'>
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
