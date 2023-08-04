import { Flex, Spinner } from '@chakra-ui/react';
import React from 'react';

const Suspender = () => {
  return (
    <Flex w='100%' h='100%' justify='center' align='center'>
      <Spinner />
    </Flex>
  );
};

export default Suspender;
