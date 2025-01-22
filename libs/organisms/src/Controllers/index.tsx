'use client';

import { Box, Flex, Heading } from '@chakra-ui/react';
import { useSelectedHat } from 'contexts';
import { CheckEligibilityForm, EditAndWearers, Eligibility, Toggle } from 'modules-ui';

const Controllers = () => {
  const { selectedHat } = useSelectedHat();
  if (selectedHat?.levelAtLocalTree === 0) return null;

  return (
    <Flex direction='column' px={{ base: 0, md: 16 }}>
      <Box px={{ base: 4, md: 0 }}>
        <Heading size='md' variant={{ base: 'medium', md: 'default' }} pb={2}>
          Control over this Hat
        </Heading>
      </Box>

      <EditAndWearers />

      <Eligibility />

      <Toggle />

      <CheckEligibilityForm />
    </Flex>
  );
};

export default Controllers;
