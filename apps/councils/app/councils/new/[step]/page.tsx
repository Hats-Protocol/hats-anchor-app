'use client';

import { CouncilFormProvider } from 'contexts';
import { useSearchParams } from 'next/navigation';
import { Card } from 'ui';

import { CouncilCreateForm } from '../../../../components/council-create-form/index';
import { CreationFormSteps } from '../../../../components/creation-form-steps';

const NewCouncil = ({ params: { step } }: { params: { step: string } }) => {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId') || '';
  const subStep = searchParams.get('subStep') || undefined;

  return (
    <CouncilFormProvider draftId={draftId}>
      <div className='grid-cols-20 grid pb-24 pt-24'>
        <div className='col-span-10 col-start-3 grid'>
          <div>
            <Card className='min-h-[300px] w-full px-16 py-10'>
              <CouncilCreateForm step={step} subStep={subStep} draftId={draftId} />
            </Card>
          </div>
        </div>

        <div className='col-start-14 col-span-6 grid'>
          <CreationFormSteps currentStep={step} currentSubStep={subStep} draftId={draftId} />
        </div>
      </div>
    </CouncilFormProvider>
  );
};

export default NewCouncil;
