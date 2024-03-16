import {
  Box,
  HStack,
  Icon,
  Image as ChakraImage,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { TemplateData } from '@hatsprotocol/constants';
import { HatIcon } from 'icons';
import { useEffect, useState } from 'react';
import { BsPeopleFill } from 'react-icons/bs';

import { ChakraNextLink } from '../atoms';

const FeaturedTreeCard = ({
  treeData,
  hatsAndWearers,
}: FeatureTreeCardProps) => {
  const { id, name, chainId, image, avatar } = treeData;
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => setImageLoaded(true);
  }, [image]);

  return (
    <ChakraNextLink href={`/trees/${chainId}/${id}`} h='207px' _hover={{}}>
      <Stack
        bg='white'
        maxW='400px'
        borderRadius={6}
        border='1px'
        borderColor='gray.600'
        h='207px'
        justify='space-between'
        spacing={0}
      >
        <Box bg='gray.100' borderTopRadius={6} flex='1' height='150px'>
          <Skeleton height='100%' borderTopRadius={6} isLoaded={imageLoaded}>
            <ChakraImage
              loading='lazy'
              src={image}
              alt={`${name} featured image`}
              w='full'
              maxH='150px'
              h='full'
              fit='cover'
              borderTopRadius={6}
            />
          </Skeleton>
        </Box>
        <HStack
          px={4}
          py={2}
          zIndex={1}
          position='relative'
          boxShadow='0px -1px 4px rgba(0, 0, 0, 0.14)'
          w='full'
        >
          <Skeleton height='100%' borderTopRadius={6} isLoaded={imageLoaded}>
            <ChakraImage
              loading='lazy'
              src={avatar}
              alt={`${name} featured avatar`}
              boxSize={14}
              display='inline-block'
              mr={3}
              mt={-8}
              borderRadius={4}
              border='1px'
              borderColor='gray.400'
            />
          </Skeleton>
          <HStack justifyContent='space-between' w='full' h='full' mb={1}>
            <Skeleton isLoaded={!!name}>
              <Text variant='medium' size='lg'>
                {name}
              </Text>
            </Skeleton>

            <Stack align='flex-end' spacing='0.2rem'>
              <HStack spacing='5px'>
                <Icon as={HatIcon} boxSize={3} />
                <Skeleton isLoaded={!!hatsAndWearers?.hats}>
                  <Text size='xs'>{hatsAndWearers?.hats || '--'}</Text>
                </Skeleton>
              </HStack>
              <HStack spacing='5px'>
                <Icon as={BsPeopleFill} boxSize={3} />
                <Skeleton isLoaded={!!hatsAndWearers?.wearers}>
                  <Text size='xs'>{hatsAndWearers?.wearers || '--'}</Text>
                </Skeleton>
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
  treeData: TemplateData;
  hatsAndWearers?: {
    treeId?: string;
    hats: number;
    wearers?: number;
  };
}
