import { Box, Flex, Heading, HStack, Image, Text } from '@chakra-ui/react';
import _ from 'lodash';
import React from 'react';

import useTreeDetails from '@/hooks/useTreeDetails';
import { prettyIdToIp, toTreeId } from '@/lib/hats';
import { ImageFile } from '@/types';

const HatCreateCard = ({
  name,
  supply,
  adminId,
  image,
  chainId,
}: HatCreateCardProps) => {
  let nextChild = `${prettyIdToIp(adminId)}.1`;
  const { data: tree } = useTreeDetails({ treeId: toTreeId(adminId), chainId });
  const children = _.filter(tree?.hats, ['admin.prettyId', adminId]);
  if (!_.isEmpty(children)) {
    const lastChildId = _.toNumber(
      _.nth(_.split(_.get(_.last(children), 'prettyId'), '.'), 1),
    );
    nextChild = `${prettyIdToIp(adminId)}.${lastChildId + 1}`;
  }

  return (
    <Flex
      direction='column'
      w='200px'
      border='1px solid'
      borderRadius='4px'
      boxShadow='md'
    >
      <Flex>
        <Box
          bgImage={image?.preview || '/icon.jpeg'}
          bgSize='contain'
          top='-1px'
          left='-1px'
          position='relative'
          borderTopLeftRadius='4px'
          minW='70px'
          h='70px'
          border='1px solid'
        />
        <Box p={1}>
          <Text fontSize='sm'>{nextChild}</Text>
          <Heading size='sm' noOfLines={2} fontWeight='medium'>
            {name || 'Enter name below'}
          </Heading>
        </Box>
      </Flex>
      <Flex
        justify='space-between'
        borderTop='1px solid'
        position='relative'
        top='-2px'
        p={1}
        px={2}
      >
        <HStack>
          <Image src='/icons/wearers.svg' alt='wearer icon' />
          <Text>No Wearers</Text>
        </HStack>
        <HStack spacing={1}>
          <Text>0</Text>
          <Text>of</Text>
          <Text>{supply || 'N'}</Text>
        </HStack>
      </Flex>
    </Flex>
  );
};

export default HatCreateCard;

interface HatCreateCardProps {
  name: string;
  supply: number;
  adminId: string | undefined;
  image: ImageFile;
  chainId: number;
}
