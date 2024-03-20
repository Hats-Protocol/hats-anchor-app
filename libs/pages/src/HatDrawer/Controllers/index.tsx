import { Flex } from '@chakra-ui/react';

import EditAndWearers from './EditAndWearers';
import Eligibility from './Eligibility';
import Toggle from './Toggle';

const Controllers = () => {
  return (
    <Flex direction='column' px={10}>
      <EditAndWearers />
      <Eligibility />
      <Toggle />
    </Flex>
  );
};

export default Controllers;
