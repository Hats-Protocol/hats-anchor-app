import { Box, HStack, Icon, Image, Text } from '@chakra-ui/react';
import { GrTextAlignLeft } from 'react-icons/gr';

import { chainsMap } from '@/lib/web3';

import ChakraNextLink from './ChakraNextLink';

const FeaturedTreeCard = ({ treeData }: FeatureTreeCardProps) => {
  const { id, name, chainId, image, description } = treeData;
  const chainName = chainsMap(chainId).name;

  return (
    <ChakraNextLink href={`/trees/${chainId}/${id}`} _hover={{}}>
      <Box border='1px solid' bg='white' maxW='400px'>
        <Box bg='gray.100'>
          <Image
            src={image}
            alt={`${name} featured image`}
            minH='250px'
            w='100%'
            fit='cover'
          />
        </Box>
        <Box borderY='1px solid' p={1} px={2}>
          <Text fontSize='xs' fontWeight={600}>
            {chainName} #{id}
          </Text>
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

export default FeaturedTreeCard;

interface FeatureTreeCardProps {
  treeData: {
    chainId: number;
    id: number;
    image: string;
    name: string;
    description: string;
  };
}
