import { Stack, Text } from '@chakra-ui/react';
import React from 'react';

import { useEligibility } from '../../contexts/EligibilityContext';

const ElectionRoles = () => {
  const { moduleDetails } = useEligibility();

  return (
    <Stack gap={4}>
      <Text fontWeight='bold'>Election Roles</Text>
      <Stack>
        {moduleDetails?.customRoles?.map((role) => (
          <Text key={role.id}>{role.name}</Text>
        ))}
      </Stack>
    </Stack>
  );
};

export default ElectionRoles;
