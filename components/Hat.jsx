/* eslint-disable no-plusplus */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-use-before-define */
// TODO fix no nested ternary
import { useState } from 'react';
import {
  Button,
  Flex,
  Icon,
  IconButton,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { BsChevronRight, BsChevronLeft } from 'react-icons/bs';
// import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/20/solid";
// import ClipLoader from "react-spinners/ClipLoader";

import AddressLink from './AddressLink';

const Hat = ({ hatData, hatLoading, hatError, network }) => {
  const [activeTab, setActiveTab] = useState('Basic Info');

  return (
    <div className='shadow-md bg-white rounded-r-md h-128  w-1/2 flex flex-col'>
      <div className=' flex-initial rounded-tr-md bg-slate-200'>
        <h1 className=' ml-2 mb-2 font-bold'>Hat</h1>
        <div className='flex'>
          <TabButton
            id='Basic Info'
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <TabButton
            id='Wearers'
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
      {hatLoading ? (
        <Flex justify='center'>
          <Spinner size='xl' />
        </Flex>
      ) : hatError ? (
        <p>{hatError.message}</p>
      ) : hatData?.hat === undefined ? (
        <p className=' m-2'>No hat chosen</p>
      ) : (
        <div className=' flex-auto'>
          <HatBasicInfo
            hatData={hatData}
            network={network}
            id='Basic Info'
            activeTab={activeTab}
          />
          <HatWearers
            hatData={hatData}
            network={network}
            id='Wearers'
            activeTab={activeTab}
          />
        </div>
      )}
    </div>
  );
};

export default Hat;

// TODO swap for chakra tabs
function TabButton({ id, activeTab, setActiveTab }) {
  if (id === activeTab) {
    return (
      <Button onClick={() => setActiveTab(id)}>
        <Text>{id}</Text>
      </Button>
    );
  }
  return (
    <Button onClick={() => setActiveTab(id)}>
      <Text>{id}</Text>
    </Button>
  );
}

function HatBasicInfo({ hatData, network, activeTab, id }) {
  if (activeTab === id) {
    return (
      <>
        <div className='flex mx-2 border-b'>
          <div className=' flex-none w-36 my-2'>Id:</div>
          <div className=' truncate break-all my-2'>{hatData.hat.id}</div>
        </div>
        <div className='flex mx-2 border-b'>
          <div className=' flex-none w-36 my-2'>Status:</div>
          <div className=' my-2'>
            {hatData.hat.status ? 'Active' : 'Not Active'}
          </div>
        </div>
        <div className='flex mx-2 border-b'>
          <div className=' flex-none w-36 my-2'>Details:</div>
          <div className=' my-2'>{hatData.hat.details}</div>
        </div>
        <div className='flex mx-2 border-b'>
          <div className=' flex-none w-36 my-2'>Image URI:</div>
          <div className=' my-2'>{hatData.hat.imageUri}</div>
        </div>
        <div className='flex mx-2 border-b'>
          <div className=' flex-none w-36 my-2'>Max Supply:</div>
          <div className=' my-2'>{hatData.hat.maxSupply}</div>
        </div>
        <div className='flex mx-2 border-b'>
          <div className=' flex-none w-36 my-2'>Current Supply:</div>
          <div className=' my-2'>{hatData.hat.currentSupply}</div>
        </div>
        <div className='flex mx-2 border-b'>
          <div className=' flex-none w-36 my-2'>Eligibility:</div>
          <div className=' my-2'>
            <AddressLink address={hatData.hat.eligibility} network={network} />
          </div>
        </div>
        <div className='flex mx-2 border-b'>
          <div className=' flex-none w-36 my-2'>Toggle:</div>
          <div className=' my-2'>
            <AddressLink address={hatData.hat.toggle} network={network} />
          </div>
        </div>
        <div className='flex mx-2 border-b'>
          <div className=' flex-none w-36 my-2'>Mutable:</div>
          <div className=' my-2'>{hatData.hat.mutable ? 'True' : 'False'}</div>
        </div>
        <div className='flex mx-2 border-b'>
          <div className=' flex-none w-36 my-2'>Level:</div>
          <div className=' my-2'>{hatData.hat.levelAtLocalTree}</div>
        </div>
        <div className='flex mx-2'>
          <div className=' flex-none w-36 my-2'>Created At:</div>
          <div className=' my-2'>
            {/* <ReactTimeAgo
              date={new Date(Number(hatData.hat.createdAt) * 1000)}
              locale='en-US'
            /> */}
          </div>
        </div>
      </>
    );
  }
  return null;
}

function HatWearers({ hatData, network, activeTab, id }) {
  const [currentPage, setCurrentPage] = useState(1);
  if (hatData.hat.wearers.length === 0) {
    return null;
  }

  const WEARERS_PER_PAGE = 5;
  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(hatData.hat.wearers.length / WEARERS_PER_PAGE);
    i++
  ) {
    pageNumbers.push(i);
  }

  const decrementCurrentPage = () => {
    if (currentPage === 1) {
      return;
    }

    setCurrentPage((curr) => curr - 1);
  };

  const incrementCurrentPage = () => {
    if (currentPage === pageNumbers.length) {
      return;
    }

    setCurrentPage((curr) => curr + 1);
  };

  // Get current wearers
  const indexOfLastWearer = currentPage * WEARERS_PER_PAGE;
  const indexOfFirstWearer = indexOfLastWearer - WEARERS_PER_PAGE;
  const currentWearers = hatData.hat.wearers.slice(
    indexOfFirstWearer,
    indexOfLastWearer,
  );
  const CurrentWearersAddresses = currentWearers.map((wearer) => {
    return wearer.id;
  });

  if (activeTab === id) {
    return (
      <div className='flex flex-col h-full justify-between'>
        <div className=''>
          {CurrentWearersAddresses.map((wearer) => {
            return (
              <div className='flex mx-2 border-b' key={wearer}>
                <div className=' flex-none w-36 my-2'>
                  <AddressLink address={wearer} network={network} />
                </div>
              </div>
            );
          })}
        </div>

        <nav className='bottom-2'>
          <ul className='flex'>
            <li className=' ml-2 mb-2 w-6'>
              <IconButton
                icon={<Icon as={BsChevronLeft} />}
                onClick={decrementCurrentPage}
                className=' text-gray-500 rounded-sm w-full'
              />
            </li>
            {pageNumbers.map((number) => {
              if (currentPage === number) {
                return (
                  <li key={number} className=' ml-2 mb-2 w-6'>
                    <Button onClick={() => setCurrentPage(number)}>
                      {number}
                    </Button>
                  </li>
                );
              }
              return (
                <li key={number} className=' ml-2 mb-2 w-6'>
                  <Button onClick={() => setCurrentPage(number)}>
                    {number}
                  </Button>
                </li>
              );
            })}
            <li className=' ml-2 mb-2 w-6'>
              <IconButton
                icon={<Icon as={BsChevronRight} />}
                onClick={incrementCurrentPage}
                className=' text-gray-500 rounded-sm w-full'
              />
            </li>
          </ul>
        </nav>
      </div>
    );
  }
  return null;
}
