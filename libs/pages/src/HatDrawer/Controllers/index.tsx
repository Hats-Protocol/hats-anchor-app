import { Flex, Heading } from '@chakra-ui/react';

import EditAndWearers from './EditAndWearers';
import Eligibility from './Eligibility';
import Toggle from './Toggle';

const Controllers = () => {
  return (
    <Flex direction='column' px={10}>
      <Heading size='md' variant={{ base: 'medium', md: 'default' }} pb={2}>
        Control over this Hat
      </Heading>
      <EditAndWearers />
      <Eligibility />
      <Toggle />
    </Flex>
  );
};

export default Controllers;
