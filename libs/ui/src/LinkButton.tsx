'use client';

// ! temporary while in UI transition

import { Button, HStack, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

import ChakraNextLink from './ChakraNextLink';

const LinkButton = ({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: ReactNode;
  children?: ReactNode;
}) => {
  return (
    <ChakraNextLink href={href}>
      <Button colorScheme='blue.500' variant='outlineMatch'>
        <HStack gap={3}>
          {icon}
          <Text variant='medium' noOfLines={1}>
            {children}
          </Text>
        </HStack>
      </Button>
    </ChakraNextLink>
  );
};

export default LinkButton;
