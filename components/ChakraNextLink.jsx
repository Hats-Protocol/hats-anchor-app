/* eslint-disable react/jsx-props-no-spreading */
import { Link as ChakraLink } from '@chakra-ui/react';
import Link from 'next/link';
import React from 'react';

const ChakraNextLink = ({ children, decoration = false, ...props }) => (
  <ChakraLink
    as={Link}
    textDecoration={decoration ? 'underline' : 'none'}
    _hover={{
      textDecoration: decoration ? 'underline' : 'none',
      color: '#23232380',
    }}
    {...props}
  >
    {children}
  </ChakraLink>
);

// Set display name for forwardRef linting
ChakraNextLink.displayName = 'ChakraNextLink';

export default ChakraNextLink;
