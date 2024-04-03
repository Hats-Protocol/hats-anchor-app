import { Flex, Heading } from '@chakra-ui/react';
import { useSelectedHat } from 'contexts';

import EditAndWearers from './EditAndWearers';
import Eligibility from './Eligibility';
import Toggle from './Toggle';

const Controllers = () => {
  const { selectedHat } = useSelectedHat();
  if (selectedHat?.levelAtLocalTree === 0) return null;

  return (
    <Flex direction='column' px={{ base: 4, md: 10 }}>
      <Heading
        size={{ base: 'sm', md: 'md' }}
        variant={{ base: 'medium', md: 'default' }}
        pb={2}
      >
        Control over this Hat
      </Heading>
      <EditAndWearers />
      <Eligibility />
      <Toggle />
    </Flex>
  );
};

export default Controllers;
