'use client';

import { CouncilFormProvider } from 'contexts';
import { useAuthGuard } from 'hooks';
import { useParams, useSearchParams } from 'next/navigation';
import { Card } from 'ui';

import { CreateFormDevDetails } from '../../../../components/council-create-form/create-form-dev-details';
import { CouncilCreateForm } from '../../../../components/council-create-form/index';
import { CreationFormSteps } from '../../../../components/creation-form-steps';

// { params }: { params: Promise<{ step: string }> } // TODO switch back to SSR page?
const NewCouncil = () => {
  const { step } = useParams();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId') || '';
  const subStep = searchParams.get('subStep') || undefined;

  useAuthGuard();

  return (
    <CouncilFormProvider draftId={draftId}>
      <div className='grid-cols-20 grid pb-24 pt-24'>
        <div className='col-span-10 col-start-3 grid'>
          <div>
            <Card className='min-h-[300px] w-full px-16 py-10'>
              <CouncilCreateForm step={step as string} subStep={subStep} draftId={draftId} />
            </Card>
          </div>

          <CreateFormDevDetails />
        </div>

        <div className='col-start-15 col-span-5 grid'>
          <CreationFormSteps currentStep={step as string} currentSubStep={subStep} draftId={draftId} />
        </div>
      </div>
    </CouncilFormProvider>
  );
};

export default NewCouncil;
