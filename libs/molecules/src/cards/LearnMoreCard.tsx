'use client';

import { Heading, HStack, Icon, Image, Stack, Text } from '@chakra-ui/react';
import { DocsLink } from 'types';
import { Link } from 'ui';

const LearnMoreCard = ({ docsData }: FeatureDocsCardProps) => {
  const { url, name, icon, image, description } = docsData;

  let displayIcon;
  if (image) {
    displayIcon = <Image src={image} alt={`${name} featured icon`} fit='cover' boxSize={8} />;
  } else {
    if (!icon) return null;
    displayIcon = <Icon as={icon} boxSize={6} />;
  }

  return (
    <Link href={url} isExternal>
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
        {displayIcon}
        <Stack>
          <Heading size='md'>{name}</Heading>
          <Text size='sm'>{description}</Text>
        </Stack>
      </HStack>
    </Link>
  );
};

export default LearnMoreCard;

interface FeatureDocsCardProps {
  docsData: DocsLink;
}
