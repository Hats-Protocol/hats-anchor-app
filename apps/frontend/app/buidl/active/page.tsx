import { DeactivationForm } from 'forms';
import { HatDeco } from 'ui';

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
    </div>
  );
};

export default MassDeactivationPage;
