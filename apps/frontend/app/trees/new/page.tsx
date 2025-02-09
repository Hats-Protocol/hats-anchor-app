import { CONFIG } from '@hatsprotocol/config';
import { NewTreeForm } from 'forms';
import { capitalize } from 'lodash';

const NewTree = () => (
  <div className='w-screen'>
    <div className='fixed z-[-5] mt-[70px] h-full w-full bg-blue-100 opacity-[0.7]' />

    <div className='flex flex-col items-center pt-[125px]'>
      <h2 className='text-2xl font-medium'>New {capitalize(CONFIG.TERMS.tree)}</h2>

      <NewTreeForm />
    </div>
  </div>
);

export default NewTree;
