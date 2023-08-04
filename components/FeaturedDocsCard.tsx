import { HStack, Image, Stack, Text } from '@chakra-ui/react';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';

const FeaturedDocsCard = ({ docsData }: FeatureDocsCardProps) => {
  const { url, name, icon, description } = docsData;

  return (
    <ChakraNextLink href={url} _hover={{}} isExternal>
      <HStack
        alignItems='start'
        p={5}
        spacing={6}
        borderRadius={6}
        border='1px solid var(--gray-600, #4A5568)'
        background='var(--white-alpha-700, rgba(255, 255, 255, 0.64))'
        boxShadow='0px 2px 4px -1px rgba(0, 0, 0, 0.06), 0px 4px 6px -1px rgba(0, 0, 0, 0.10)'
      >
        <Image
          src={`/icons/${icon}.svg`}
          alt={`${name} featured icon`}
          fit='cover'
          w={8}
        />
        <Stack>
          <Text fontWeight={600}>{name}</Text>
          <Text fontSize='sm'>{description}</Text>
        </Stack>
      </HStack>
    </ChakraNextLink>
  );
};

export default FeaturedDocsCard;

interface FeatureDocsCardProps {
  docsData: {
    url: string;
    icon: string;
    name: string;
    description: string;
  };
}
