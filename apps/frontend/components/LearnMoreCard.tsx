import { HStack, Image, Stack, Text } from '@chakra-ui/react';
import { ChakraNextLink } from 'ui';

const LearnMoreCard = ({ docsData }: FeatureDocsCardProps) => {
  const { url, name, icon, description } = docsData;

  return (
    <ChakraNextLink href={url} _hover={{}} isExternal>
      <HStack
        alignItems='start'
        p={5}
        spacing={6}
        borderRadius={6}
        border='1px'
        borderColor='gray.600'
        background='whiteAlpha.700'
        boxShadow='md'
        h='full'
      >
        <Image
          src={`/icons/${icon}.svg`}
          alt={`${name} featured icon`}
          fit='cover'
          w={8}
        />
        <Stack>
          <Text fontWeight='semibold'>{name}</Text>
          <Text fontSize='sm'>{description}</Text>
        </Stack>
      </HStack>
    </ChakraNextLink>
  );
};

export default LearnMoreCard;

export type DocsLink = {
  url: string;
  icon: string;
  name: string;
  description: string;
};

interface FeatureDocsCardProps {
  docsData: DocsLink;
}
