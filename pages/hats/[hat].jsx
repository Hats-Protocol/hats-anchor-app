// import { PaperClipIcon } from '@heroicons/react/20/solid'
// import { ethers } from 'ethers';
import { useState } from 'react';
import UriComponent from '../../components/UriComponent';
import Layout from '../../components/Layout';
import abi from '../../contracts/Hats.json';

//! TO BE ARCHIVED
// TODO migrating this to nested tree view for now
// - should have the hatID in the URL and automatically load the page
// - switch contract over to Polygon (including ABI); add Image
// - read from subgraph? (will make tree query easier for example)

const HatDetail = ({ hat }) => {
  const [hatId, setHatId] = useState('');
  const [contractVars, setContractVars] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // async function getContractUri(hId) {
  //   const internalContractVars = await contract.uri(hId);
  //   setContractVars(internalContractVars);
  //   setFormSubmitted(true);
  // }

  return (
    <Layout>
      <div>
        {/* <label
          htmlFor='email'
          className='block text-lg font-medium text-gray-700'
        >
          Enter a Hat ID
        </label> */}
        <div className='mt-4'>
          <input
            onChange={(e) => setHatId(e.target.value)}
            id='hatid'
            name='hatid'
            type='text'
            required
            className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm'
            placeholder='0xdec1a551edc8E90514F3b74740792bCCdA267b00'
          />
        </div>
        <div className='mt-4 flex justify-center'>
          <button
            // onClick={() => getContractUri(hatId)}
            type='button'
            className='w-40 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          >
            View Hat
          </button>
        </div>
      </div>
      {formSubmitted && <UriComponent c={contractVars} />}
    </Layout>
  );
};

// TODO move these to another constant

export const getStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          hat: '0xB7019C3670F5d4dD99166727a7D29F8A16F4F20A',
        },
      },
      {
        params: {
          hat: '0x95647f88dcbc12986046fc4f49064edd11a25d38',
        },
      },
    ],
    fallback: false,
  };
};

export const getStaticProps = async (context) => {
  const { params } = context;
  const { hat } = params;
  return {
    props: {
      hat,
    },
  };
};

export default HatDetail;
