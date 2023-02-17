import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <Flex direction='column' align='center'>
      <Navbar />
      <Box w='80%' my={20}>
        {children}
      </Box>
    </Flex>
  );
};

export default Layout;
