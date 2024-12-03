import { HatDeco } from 'ui';

import { ChainModuleForm } from 'forms';

const ChainModuleDeployer = () => {
  return (
    <div className='mx-auto flex max-w-screen-lg flex-col gap-4 pt-32'>
      <ChainModuleForm />

      <HatDeco />
    </div>
  );
};

export default ChainModuleDeployer;
