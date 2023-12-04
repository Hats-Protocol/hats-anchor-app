import { Box, HStack, Image, Stack, Text } from '@chakra-ui/react';

import ChakraNextLink from './atoms/ChakraNextLink';

const ForkableTemplateCard = ({ treeData }: FeatureTreeCardProps) => {
  const { id, name, chainId, image, description } = treeData;

  return (
    <ChakraNextLink href={`/trees/${chainId}/${id}`} _hover={{}}>
      <HStack
        bg='white'
        maxW='400px'
        borderRadius={6}
        border='1px'
        borderColor='gray.600'
        h='full'
      >
        <Stack
          px={4}
          py={4}
          zIndex={1}
          position='relative'
          borderRight='1px'
          borderColor='gray.200'
          w='full'
          h='full'
        >
          <Text fontWeight='semibold'>{name}</Text>
          <Text fontWeight='medium' fontSize='sm'>
            {description}
          </Text>
        </Stack>
        <Box bg='#EDF1F7' borderTopRadius={6} mr={1}>
          <Image
            loading='lazy'
            src={image}
            alt={`${name} featured image`}
            w='100%'
            maxW={200}
            fit='cover'
            borderTopRadius={6}
          />
        </Box>
      </HStack>
    </ChakraNextLink>
  );
};

export default ForkableTemplateCard;

interface FeatureTreeCardProps {
  treeData: {
    chainId: number;
    id: number;
    image: string;
    name: string;
    description: string;
  };
}
