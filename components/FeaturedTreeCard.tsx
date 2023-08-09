import { Box, HStack, Icon, Image, Stack, Text } from '@chakra-ui/react';
import { BsPeopleFill } from 'react-icons/bs';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';

const FeaturedTreeCard = ({
  treeData,
  hatsAndWearers,
}: FeatureTreeCardProps) => {
  const { id, name, chainId, image, avatar } = treeData;

  return (
    <ChakraNextLink href={`/trees/${chainId}/${id}`} _hover={{}}>
      <Stack
        bg='white'
        maxW='400px'
        borderRadius={6}
        border='1px'
        borderColor='gray.600'
        h='full'
        justifyItems='space-between'
        spacing={0}
      >
        <Box bg='gray.100' borderTopRadius={6} flex='1'>
          <Image
            loading='lazy'
            src={image}
            alt={`${name} featured image`}
            w='full'
            maxH='150px'
            h='full'
            fit='cover'
            borderTopRadius={6}
          />
        </Box>
        <HStack
          px={4}
          py={2}
          zIndex={1}
          position='relative'
          boxShadow='0px -1px 4px rgba(0, 0, 0, 0.14)'
          w='full'
        >
          <Image
            loading='lazy'
            src={avatar}
            alt={`${name} featured avatar`}
            w={14}
            h={14}
            display='inline-block'
            mr={3}
            mt={-8}
            borderRadius={4}
          />
          <HStack justifyContent='space-between' w='full' h='full' mb={1}>
            <Text fontWeight='medium' fontSize={18}>
              {name}
            </Text>

            <Stack align='flex-end' spacing='0.2rem'>
              <HStack spacing='5px'>
                <Image src='/icons/hat.svg' alt='Hat' w={3} h={3} />
                <Text fontSize='xs'>{hatsAndWearers?.hats}</Text>
              </HStack>
              <HStack spacing='5px'>
                <Icon as={BsPeopleFill} w={3} h={3} />
                <Text fontSize='xs'>{hatsAndWearers?.wearers}</Text>
              </HStack>
            </Stack>
          </HStack>
        </HStack>
      </Stack>
    </ChakraNextLink>
  );
};

export default FeaturedTreeCard;

interface FeatureTreeCardProps {
  treeData: {
    chainId: number;
    id: number;
    image: string;
    name: string;
    description: string;
    avatar: string;
  };
  hatsAndWearers: {
    treeId: number;
    hats: number;
    wearers?: number;
  };
}
