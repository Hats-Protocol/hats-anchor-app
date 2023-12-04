/* eslint-disable react/jsx-props-no-spreading */
import { Link as ChakraLink, LinkProps } from '@chakra-ui/react';
import Link from 'next/link';
import { ReactNode } from 'react';

const ChakraNextLink = ({
  children,
  decoration = false,
  ...props
}: {
  href: string;
  onClick?: () => void;
  children?: ReactNode;
  decoration?: boolean;
  isExternal?: boolean;
} & LinkProps) => (
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
