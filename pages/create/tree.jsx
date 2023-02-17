// import { useForm } from "react-hook-form";
import { Spinner } from '@chakra-ui/react';
import { useState } from 'react';
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import abi from '../../contracts/Hats.json';

export default function CreateTree() {
  const [values, setValues] = useState({
    address: '',
    details: '',
    imageUri: '',
  });

  const { config } = usePrepareContractWrite({
    address: '0x96bD657Fcc04c71B47f896a829E5728415cbcAa1',
    abi: JSON.stringify(abi),
    functionName: 'mintTopHat',
    args: [values.address, values.details, values.imageUri],
    enabled:
      values.address !== '' && values.details !== '' && values.imageUri !== '',
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    write?.();
    // console.log(values);
  };

  const onChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <div className='bg-slate-50 flex-grow '>
      <div className='max-w-screen-xl m-auto'>
        <form
          onSubmit={handleSubmit}
          className='mt-8 rounded-md shadow-md bg-white'
        >
          <div className='space-y-6 mx-4 flex flex-col'>
            <div>
              <h3 className='text-lg font-medium leading-6 text-gray-900 mt-4'>
                Tree Details
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                This information will be displayed publicly so be careful what
                you share.
              </p>
            </div>

            <div className=''>
              {/* <label
                htmlFor='address'
                className='block text-sm font-medium text-gray-700'
              >
                Top-Hat Address
              </label> */}
              <input
                type='text'
                name='address'
                id='address'
                className='block w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm mt-2'
                placeholder='0x123...'
                onChange={onChange}
              />
              <p className='mt-2 text-sm text-gray-500 in'>
                Address of the top most admin, aka the top-hat.
              </p>
            </div>

            <div className=''>
              {/* <label
                htmlFor='details'
                className='block text-sm font-medium text-gray-700'
              >
                Details
              </label> */}
              <div className='mt-1'>
                <textarea
                  id='details'
                  name='details'
                  rows={3}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  placeholder='Tree description'
                  onChange={onChange}
                />
              </div>
              <p className='mt-2 text-sm text-gray-500'>
                Brief description of the tree.
              </p>
            </div>

            <div className=''>
              {/* <label
                htmlFor='imageUri'
                className='block text-sm font-medium text-gray-700'
              >
                Image URI
              </label> */}
              <input
                type='text'
                name='imageUri'
                id='imageUri'
                className='block w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm mt-2'
                placeholder='https://ipfs.io/ipfs/...'
                onChange={onChange}
              />
              <p className='mt-2 text-sm text-gray-500'>
                What image do you want to represent this tree? This will be the
                image that appears alongside the top-hat token in the Hats dapp,
                other apps integrating with Hats Protocol, and anywhere the hat
                NFTs are viewable.
              </p>
            </div>
            <div>
              <button
                type='submit'
                disabled={!write}
                className='mb-2 rounded-md border border-transparent bg-indigo-600 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              >
                {isLoading ? <Spinner /> : <div className='m-2'>Create</div>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
