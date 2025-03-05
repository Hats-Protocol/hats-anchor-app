import { DeactivationForm } from 'forms';
import dynamic from 'next/dynamic';
import { HatDeco } from 'ui';

const BetaFeatureClient = dynamic(() => import('molecules').then((mod) => mod.BetaFeatureClient));

const MassDeactivationPage = () => {
  return (
    <div className='mx-auto flex max-w-screen-md flex-col gap-4 pt-28'>
      <div className='flex justify-center'>
        <h2 className='text-2xl font-bold'>Mass Activate/Deactivate Hats</h2>
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
