import { Box, HStack, Image, Stack, Text } from '@chakra-ui/react';
import { BsPeopleFill } from 'react-icons/bs';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';

const FeaturedTreeCard = ({
  treeData,
  hatsAndWearers,
}: FeatureTreeCardProps) => {
  const { id, name, chainId, image, avatar } = treeData;

  return (
    <ChakraNextLink href={`/trees/${chainId}/${id}`} _hover={{}}>
      <Box
        bg='white'
        maxW='400px'
        borderRadius={6}
        border='1px solid var(--gray-600, #4A5568)'
      >
        <Box bg='gray.100' borderTopRadius={6}>
          <Image
            loading='lazy'
            src={image}
            alt={`${name} featured image`}
            w='100%'
            fit='cover'
            borderTopRadius={6}
          />
        </Box>
        <HStack
          px={4}
          py={4}
          zIndex={1}
          position='relative'
          boxShadow='0px -1px 4px rgba(0, 0, 0, 0.14)'
          w='full'
        >
          <Image
            loading='lazy'
            src={avatar}
            alt={`${name} featured avatar`}
            w={12}
            h={12}
            display='inline-block'
            mr={2}
            mt={-14}
            borderRadius={4}
          />
          <HStack justifyContent='space-between' w='full'>
            <Text fontWeight={500} fontSize={18}>
              {name}
            </Text>

            <Stack>
              <HStack>
                <Image src='/icons/hat.svg' alt='Hat' />
                <Text fontWeight={600}>{hatsAndWearers?.hats}</Text>
              </HStack>
              <HStack>
                <BsPeopleFill />
                <Text fontSize='sm'>{hatsAndWearers?.wearers}</Text>
              </HStack>
            </Stack>
          </HStack>
        </HStack>
      </Box>
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
    wearers: number;
  };
}
