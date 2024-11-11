import { CouncilCreateForm } from 'forms';
import { Card } from 'ui';

import { CreationFormSteps } from '../../../../components';

const NewCouncil = ({ params: { step } }: { params: { step: string } }) => {
  console.log(step);

  // TODO identifier could be ID in database, slug or chainId/hatId

  return (
    <div className='grid-cols-20 grid pt-32'>
      <div className='col-span-10 col-start-3 grid'>
        <Card className='w-100 min-h-[500px] p-4'>
          <CouncilCreateForm />
        </Card>
      </div>

      <div className='col-start-14 col-span-6 grid'>
        <CreationFormSteps />
      </div>
    </div>
  );
};

export default NewCouncil;
