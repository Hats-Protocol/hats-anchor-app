import { Modal, useEligibility } from 'contexts';
import { ModuleDetails } from 'types';
import { Card } from 'ui';

import { CurrentSeason } from './current-season';
import { ElectionRoles } from './election-roles';
import { UpcomingSeason } from './upcoming-season';
import { WearersList } from './wearers-list';

export const ElectionClaimsModal = ({ moduleDetails }: { moduleDetails: ModuleDetails }) => {
  const { selectedHat, selectedHatDetails } = useEligibility();

  return (
    <Modal name='electionManagerClaims' title={`Election for ${selectedHatDetails?.name || selectedHat?.details}`}>
      <div className='flex flex-col gap-4'>
        <Card className='w-full p-4'>
          <CurrentSeason />
        </Card>

        <Card className='w-full p-4'>
          <WearersList />
        </Card>

        <Card className='w-full p-4'>
          <UpcomingSeason />
        </Card>

        <Card className='w-full p-4'>
          <ElectionRoles />
        </Card>
      </div>
    </Modal>
  );
};
