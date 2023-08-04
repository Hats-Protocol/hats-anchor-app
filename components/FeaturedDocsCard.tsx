import { Box, HStack, Icon, Image, Text } from '@chakra-ui/react';
import { GrTextAlignLeft } from 'react-icons/gr';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';

const FeaturedDocsCard = ({ docsData }: FeatureDocsCardProps) => {
  const { url, name, image, description } = docsData;

  return (
    <ChakraNextLink href={url} _hover={{}} isExternal>
      <Box border='1px solid' bg='white' maxW='400px'>
        <Box bg='gray.100'>
          <Image
            src={image}
            alt={`${name} featured image`}
            minH='150px'
            w='100%'
            fit='cover'
          />
        </Box>
        <Box borderY='1px solid' p={1} px={2}>
          <Text fontWeight={600}>{name}</Text>
        </Box>
        <Box p={1} px={2}>
          <HStack>
            <Icon as={GrTextAlignLeft} h='13px' />
            <Text fontSize='sm' noOfLines={1}>
              {description}
            </Text>
          </HStack>
        </Box>
      </Box>
    </ChakraNextLink>
  );
};

export default FeaturedDocsCard;

interface FeatureDocsCardProps {
  docsData: {
    url: string;
    image: string;
    name: string;
    description: string;
  };
}
