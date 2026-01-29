import { DeactivationForm } from 'forms';
import { BetaFeatureClient } from 'molecules';
import { HatDeco } from 'ui';

const MassDeactivationPage = () => {
  return (
    <div className='mx-auto flex max-w-screen-md flex-col gap-4 pt-28'>
      <div className='flex justify-center'>
        <h2 className='text-2xl font-bold'>Mass Deactivate Hats</h2>
      </div>

      <div>
        <DeactivationForm />
      </div>
      <HatDeco />

      <BetaFeatureClient>
        <div className='flex flex-col items-center gap-2 text-sm text-gray-500'>
          <div className='flex gap-2'>
            <span>✅ Beta features are enabled</span>
          </div>
        </div>
      </BetaFeatureClient>
    </div>
  );
};

export default MassDeactivationPage;
