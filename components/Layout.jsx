import React from 'react';
import { Box, Flex, Text, HStack } from '@chakra-ui/react';
import Navbar from './Navbar';
import CommandPalette from './CommandPalette';
import CONFIG from '../constants';
import ChakraNextLink from './ChakraNextLink';

const Layout = ({ children }) => {
  const link = null;

  return (
    <Flex direction='column' align='center' bg='blue.50' minH='100vh' h='100%'>
      {(CONFIG.banner1 || CONFIG.banner2) && (
        <Flex
          bg='blue.600'
          w='100%'
          h={16}
          align='center'
          justify='center'
          color='white'
          position='fixed'
          zIndex={10}
        >
          <HStack spacing={1}>
            <Text fontWeight={600}>Announcement:</Text>
            {CONFIG.banner1 && (
              <Text textAlign='center'>
                Hat creation and editing will be temporarily disabled from this
                front-end for 48 hours (until Wednesday July 12th at noon EST)
                while we migrate to v2.0.
              </Text>
            )}
            {CONFIG.banner2 && (
              <Text>
                This version of the app (v1.3) is now deprecated. The live
                version (v2.0) is now deployed to app.hatsprotocol.xyz.
              </Text>
            )}
            {link && (
              <ChakraNextLink href={link} decoration isExternal>
                Read more here.
              </ChakraNextLink>
            )}
          </HStack>
        </Flex>
      )}
      <Navbar />
      <CommandPalette />
      <Box w='90%' my={20} mt={40}>
        {children}
      </Box>
    </Flex>
  );
};

export default Layout;
