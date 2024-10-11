'use client';

import {
  Box,
  HStack,
  Icon,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { TemplateData } from '@hatsprotocol/constants';
import dynamic from 'next/dynamic';
import { BsPeopleFill } from 'react-icons/bs';
import { ChakraNextLink, LazyImage } from 'ui';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const FeaturedTreeCard = ({
  treeData,
  hatsAndWearers,
}: FeatureTreeCardProps) => {
  const { id, name, chainId, image, avatar } = treeData;

  return (
    <ChakraNextLink
      href={`/trees/${chainId}/${id}`}
      h='100%'
      minH='207px'
      _hover={{}}
    >
      <Skeleton isLoaded={!!name}>
        <Stack
          bg='white'
          borderRadius={6}
          border='1px'
          borderColor='gray.600'
          justify='space-between'
          spacing={0}
          height='100%'
        >
          <Box bg='gray.100' borderTopRadius={6} flex='1' height='150px'>
            <LazyImage
              src={image}
              alt={`${name} featured image`}
              h='200px'
              w='full'
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
            <Box display='inline-block' mt={-8}>
              <LazyImage
                src={avatar}
                alt={`${name} featured avatar`}
                boxSize={75}
              />
            </Box>

            <HStack justifyContent='space-between' w='full' h='full' ml={2}>
              <Skeleton isLoaded={!!name}>
                <Text variant='medium' size='xl'>
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
      </Skeleton>
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
