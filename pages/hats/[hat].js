// import { PaperClipIcon } from '@heroicons/react/20/solid'
import { ethers } from 'ethers';
import { useState } from 'react';
import UriComponent from '../../components/UriComponent';
import abi from '../../contracts/Hats.json';

const HATS_POLYGON_ADDRESS = '0xB7019C3670F5d4dD99166727a7D29F8A16F4F20A';
// '0x95647f88dcbc12986046fc4f49064edd11a25d38' (polygon, current is goerli)
// const node = "https://polygon-mainnet.infura.io/v3/f7b3bd0fdb174f0fac4aded22da36341";
// const provider = new ethers.providers.WebSocketProvider(node);
const provider = ethers.getDefaultProvider('goerli');

const contract = new ethers.Contract(HATS_POLYGON_ADDRESS, abi, provider);

// TODO
// - [seems fixed...] fix too many requests error
// - implement figma designs
// - should have the hatID in the URL and automatically load the page
// - switch contract over to Polygon (including ABI); add Image
// - read from subgraph? (will make tree query easier for example)

function Home() {
  const [hatId, setHatId] = useState('');
  const [contractVars, setContractVars] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);

  async function getContractUri(hId) {
    const internalContractVars = await contract.uri(hId);
    setContractVars(internalContractVars);
    setFormSubmitted(true);
  }

  return (
    <div>
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
            onClick={() => getContractUri(hatId)}
            type='button'
            className='w-40 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          >
            View Hat
          </button>
        </div>
      </div>
      {formSubmitted && <UriComponent c={contractVars} />}
    </div>
  );
}

export default Home;
