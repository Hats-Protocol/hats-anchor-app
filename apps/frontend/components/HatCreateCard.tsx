import { Box, Flex, Heading, HStack, Icon, Text } from '@chakra-ui/react';
import { ImageFile } from 'hats-types';
import React from 'react';
import { BsPersonBadge } from 'react-icons/bs';

const HatCreateCard = ({
  name,
  supply,
  nextChild,
  image,
}: HatCreateCardProps) => {
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
          <Heading size='sm' variant='medium' noOfLines={2}>
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
          <Icon as={BsPersonBadge} w={4} h={4} color='gray.500' />
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
  nextChild: string | undefined;
  image: ImageFile;
}
