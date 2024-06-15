'use client';

import { Box, Card, Flex, Heading, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails, useHatDetailsField } from 'hats-hooks';
import { getTreeId } from 'hats-utils';
import _ from 'lodash';
import { AppHat, SupportedChains } from 'types';

import { ChakraNextLink } from '../atoms';

// TODO optimize top hat fetch
const WearerHatCard = ({
  hat,
  chainId,
}: {
  hat: AppHat;
  chainId: SupportedChains | undefined;
}) => {
  const { data: hatDetails } = useHatDetailsField(_.get(hat, 'details'));

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
          <Flex justify='space-between' gap={2}>
            <Heading size='xs' noOfLines={1}>
              {topHatName}
            </Heading>
            <Text size='xs' variant='gray'>
              {hatIdDecimalToIp(BigInt(_.get(hat, 'id')))}
            </Text>
          </Flex>

          <Heading size='md' noOfLines={1}>
            {hatName}
          </Heading>
        </Box>
      </Card>
    </ChakraNextLink>
  );
};

export default WearerHatCard;
