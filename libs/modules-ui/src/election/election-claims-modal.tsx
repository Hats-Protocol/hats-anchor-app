import { Card, CardBody, Stack } from '@chakra-ui/react';
import { Modal, useEligibility } from 'contexts';

import { CurrentSeason } from './current-season';
import { ElectionRoles } from './election-roles';
import { UpcomingSeason } from './upcoming-season';
import { WearersList } from './wearers-list';

export const ElectionClaimsModal = () => {
  const { selectedHat, selectedHatDetails } = useEligibility();

  return (
    <Modal
      name='electionManagerClaims'
      title={`Election for ${selectedHatDetails?.name || selectedHat?.details}`}
    >
      <Stack spacing={4}>
        <Card w='full'>
          <CardBody>
            <CurrentSeason />
          </CardBody>
        </Card>

        <Card w='full'>
          <CardBody>
            <WearersList />
          </CardBody>
        </Card>

        <Card w='full'>
          <CardBody>
            <UpcomingSeason />
          </CardBody>
        </Card>

        <Card w='full'>
          <CardBody>
            <ElectionRoles />
          </CardBody>
        </Card>
      </Stack>
    </Modal>
  );
};
