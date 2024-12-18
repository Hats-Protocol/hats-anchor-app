import { ChainModuleForm } from 'forms';
import { HatDeco } from 'ui';

const ChainModuleDeployer = () => {
  return (
    <div className='mx-auto flex max-w-screen-md flex-col gap-4 pt-32'>
      <ChainModuleForm />

      <HatDeco />
    </div>
  );
};

export default ChainModuleDeployer;
