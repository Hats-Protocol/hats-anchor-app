import React from 'react';
import { Link as ChakraLink } from '@chakra-ui/react';
import Link from 'next/link';

const ChakraNextLink = ({ href, children, decoration = false }, ref) => (
  <ChakraLink
    as={Link}
    href={href}
    ref={ref}
    textDecoration={decoration ? 'underline' : 'none'}
    _hover={{
      textDecoration: decoration ? 'underline' : 'none',
      color: '#23232380',
    }}
  >
    {children}
  </ChakraLink>
);

// Set display name for forwardRef linting
ChakraNextLink.displayName = 'ChakraNextLink';

export default ChakraNextLink;
