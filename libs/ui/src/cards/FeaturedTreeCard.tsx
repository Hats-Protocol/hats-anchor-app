'use client';

import {
  Box,
  HStack,
  Icon,
  Image as ChakraImage,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { TemplateData } from '@hatsprotocol/constants';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { BsPeopleFill } from 'react-icons/bs';

import { ChakraNextLink } from '../atoms';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

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
          <Skeleton
            display='inline-block'
            boxSize={14}
            borderTopRadius={6}
            isLoaded={imageLoaded}
            mt={-8}
            position='absolute'
          >
            <ChakraImage
              loading='lazy'
              src={avatar}
              alt={`${name} featured avatar`}
              boxSize='100%'
              borderRadius={4}
              border='1px'
              borderColor='gray.400'
              background='white'
            />
          </Skeleton>
          <HStack
            justifyContent='space-between'
            w='full'
            h='full'
            mb={1}
            ml={16}
          >
            <Skeleton isLoaded={!!name}>
              <Text variant='medium' size='lg'>
                {name}
              </Text>
            </Skeleton>

            <Stack align='flex-end' spacing='0.2rem'>
              <Tooltip
                label={hatsAndWearers?.hats && `${hatsAndWearers?.hats} hats`}
                placement='left'
                hasArrow
              >
                <HStack spacing='5px'>
                  <Icon as={HatIcon} boxSize={3} />
                  <Skeleton isLoaded={!!hatsAndWearers?.hats}>
                    <Text size='xs'>
                      {treeData?.hats || hatsAndWearers?.hats || '--'}
                    </Text>
                  </Skeleton>
                </HStack>
              </Tooltip>
              <Tooltip
                label={
                  hatsAndWearers?.wearers &&
                  `${hatsAndWearers?.wearers} wearers`
                }
                placement='left'
                hasArrow
              >
                <HStack spacing='5px'>
                  <Icon as={BsPeopleFill} boxSize={3} />
                  <Skeleton isLoaded={!!hatsAndWearers?.wearers}>
                    <Text size='xs'>
                      {treeData?.wearers || hatsAndWearers?.wearers || '--'}
                    </Text>
                  </Skeleton>
                </HStack>
              </Tooltip>
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
    hats?: number;
    wearers?: number;
  };
}
