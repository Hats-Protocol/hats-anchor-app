import { Stack, Text } from '@chakra-ui/react';
import { idToIp } from 'shared';

import { useEligibility } from '../../contexts/EligibilityContext';

const ElectionRoles = () => {
  const { electionsAuthority } = useEligibility();

  return (
    <Stack gap={4}>
      <Text fontWeight='bold'>Election Roles</Text>
      <Stack fontSize='sm'>
        {electionsAuthority.adminHat?.length > 0 && (
          <Text>Set up by Hat {idToIp(electionsAuthority.adminHat[0].id)}</Text>
        )}
        {electionsAuthority?.ballotBoxHat?.id && (
          <Text>
            Ballot Box set by Hat {idToIp(electionsAuthority.ballotBoxHat.id)}
          </Text>
        )}
      </Stack>
    </Stack>
  );
};

export default ElectionRoles;
