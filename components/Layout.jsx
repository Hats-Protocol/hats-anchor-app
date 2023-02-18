import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Navbar from './Navbar';
import CommandPalette from './CommandPalette';

const Layout = ({ children }) => {
  return (
    <Flex direction='column' align='center' bg='blue.50' minH='100vh' h='100%'>
      <Navbar />
      <CommandPalette />
      <Box w='80%' my={20} mt={40}>
        {children}
      </Box>
    </Flex>
  );
};

export default Layout;
