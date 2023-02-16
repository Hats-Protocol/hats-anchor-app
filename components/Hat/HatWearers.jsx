/* eslint-disable no-plusplus */
import { useState } from 'react';
import { Icon, IconButton, Button } from '@chakra-ui/react';
import { BsChevronRight, BsChevronLeft } from 'react-icons/bs';
import AddressLink from '../AddressLink';

function HatWearers({ hatData, chainId }) {
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

  return (
    <div className='flex flex-col h-full justify-between'>
      <div className=''>
        {CurrentWearersAddresses.map((wearer) => {
          return (
            <div className='flex mx-2 border-b' key={wearer}>
              <div className=' flex-none w-36 my-2'>
                <AddressLink address={wearer} chainId={chainId} />
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
                <Button onClick={() => setCurrentPage(number)}>{number}</Button>
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

export default HatWearers;
