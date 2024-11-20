'use client';

import { useSearchParams } from 'next/navigation';
import { Card } from 'ui';

import { CouncilCreateForm } from '../../../../components/council-create-form';
import { CreationFormSteps } from '../../../../components/creation-form-steps';

const NewCouncil = ({ params: { step } }: { params: { step: string } }) => {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId') || '';

  return (
    <div className='grid-cols-20 grid pb-24 pt-24'>
      <div className='col-span-10 col-start-3 grid'>
        <Card className='w-100 min-h-[500px] p-4'>
          <CouncilCreateForm step={step} draftId={draftId} />
        </Card>
      </div>

      <div className='col-start-14 col-span-6 grid'>
        <CreationFormSteps currentStep={step} draftId={draftId} />
      </div>
    </div>
  );
};

export default NewCouncil;
