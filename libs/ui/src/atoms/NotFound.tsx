'use client';

import { Button, Flex, Heading, Icon, Stack, Text } from '@chakra-ui/react';
import { FaArrowRight } from 'react-icons/fa';

import ChakraNextLink from './ChakraNextLink';

const NotFound = () => {
  return (
    <Flex justify='center' align='center' minH='100vh'>
      <Stack align='center' minW='400px' spacing={6}>
        <Heading size='3xl'>Not found!</Heading>
        <Text maxW='400px' textAlign='center'>
          We couldn&apos;t find what you were looking for. Try navigating again
          or head home.
        </Text>

        <ChakraNextLink href='/'>
          <Button variant='primary' rightIcon={<Icon as={FaArrowRight} />}>
            Go Home
          </Button>
        </ChakraNextLink>
      </Stack>
    </Flex>
  );
};

export default NotFound;
