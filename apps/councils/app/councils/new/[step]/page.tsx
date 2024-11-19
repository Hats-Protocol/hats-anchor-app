'use client';

import { useSearchParams } from 'next/navigation';
import { Card } from 'ui';

import { CouncilCreateForm } from '../../../../components/council-create-form';
import { CreationFormSteps } from '../../../../components/creation-form-steps';
import { CouncilFormProvider } from '../../../../contexts/council-form';

const NewCouncil = ({ params: { step } }: { params: { step: string } }) => {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId') || '';

  return (
    <CouncilFormProvider>
      <div className='grid-cols-20 grid pt-32'>
        <div className='col-span-10 col-start-3 grid'>
          <Card className='w-100 min-h-[500px] p-4'>
            <CouncilCreateForm step={step} />
          </Card>
        </div>

        <div className='col-start-14 col-span-6 grid'>
          <CreationFormSteps currentStep={step} draftId={draftId} />
        </div>
      </div>
    </CouncilFormProvider>
  );
};

export default NewCouncil;
