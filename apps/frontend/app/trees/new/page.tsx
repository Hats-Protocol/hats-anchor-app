import { CONFIG } from '@hatsprotocol/constants';
import { NewTreeForm } from 'forms';
import _ from 'lodash';

const NewTree = () => (
  <>
    <div className='fixed w-full h-full bg-blue-100 opacity-[0.7] z-[-5] mt-[70px]' />

    <div className='flex flex-col items-center pt-[125px]'>
      <h2 className='text-2xl font-medium'>New {_.capitalize(CONFIG.tree)}</h2>

      <NewTreeForm />
    </div>
  </>
);

export default NewTree;
