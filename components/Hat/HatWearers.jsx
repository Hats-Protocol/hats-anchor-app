/* eslint-disable no-plusplus */
import _ from 'lodash';
import { useMemo, useState } from 'react';
import {
  Icon,
  IconButton,
  Button,
  HStack,
  Flex,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { BsChevronRight, BsChevronLeft } from 'react-icons/bs';

import Link from '../ChakraNextLink';
import { formatAddress } from '../../lib/general';
import HatWearerForm from '../../forms/HatWearerForm';
import Modal from '../Modal';
import { useOverlay } from '../../contexts/OverlayContext';

const WEARERS_PER_PAGE = 5;
// TODO clean up pagination

function HatWearers({ hatData, chainId }) {
  const [currentPage, setCurrentPage] = useState(0);
  const wearers = _.get(hatData, 'wearers', []);
  const { address } = useAccount();
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const wearerPages = useMemo(() => {
    const w = [];
    let tempArray = [];
    for (let i = 0; i < wearers.length; i++) {
      if (tempArray.length === WEARERS_PER_PAGE) {
        w.push(tempArray);
        tempArray = [];
      }
      tempArray.push(wearers[i].id);
    }
    if (tempArray.length > 0) {
      w.push(tempArray);
    }

    return {
      pages: w,
      count: _.size(w),
      pageNumbers: Array.from({ length: _.size(w) }, (__, i) => i + 1),
    };
  }, [wearers]);

  const decrementCurrentPage = () => {
    if (currentPage !== 1) setCurrentPage((curr) => curr - 1);
  };

  const incrementCurrentPage = () => {
    if (currentPage !== wearerPages.count) setCurrentPage((curr) => curr + 1);
  };

  return (
    <>
      <Modal name='newWearer' title='Mint Hat' localOverlay={localOverlay}>
        <HatWearerForm hatId={_.get(hatData, 'id')} chainId={chainId} />
      </Modal>

      <Stack align='center' spacing={4}>
        <Flex justify='space-between' w='100%'>
          <HStack spacing={1}>
            {_.get(hatData, 'currentSupply') &&
              _.get(hatData, 'currentSupply') !==
                _.get(hatData, 'maxSupply') && (
                <Text>{_.get(hatData, 'currentSupply')} Worn /</Text>
              )}
            <Text>{_.get(hatData, 'maxSupply')} Max Supply</Text>
          </HStack>

          {_.get(hatData, 'currentSupply') !== _.get(hatData, 'maxSupply') &&
            address && (
              <Button
                onClick={() => setModals({ newWearer: true })}
                variant='outline'
              >
                Mint to New Wearer
              </Button>
            )}
        </Flex>

        <Stack w='100%'>
          {_.isEmpty(wearers) ? (
            <Flex justify='center' my={6}>
              <Text>No wearers yet</Text>
            </Flex>
          ) : (
            wearerPages.pages?.[currentPage]?.map((wearer) => (
              <Link href={`/wearers/${wearer}`} key={wearer}>
                <Flex
                  borderBottom='1px solid'
                  borderColor='gray.400'
                  key={wearer}
                  align='center'
                  justify='space-between'
                  p={1}
                >
                  <Text>{formatAddress(wearer)}</Text>

                  <Icon as={BsChevronRight} />
                </Flex>
              </Link>
            ))
          )}
        </Stack>

        <HStack spacing={3}>
          <IconButton
            icon={<Icon as={BsChevronLeft} />}
            onClick={decrementCurrentPage}
            isDisabled={currentPage === 0}
          />
          {wearerPages?.pageNumbers?.map((number) => {
            return (
              <Button
                onClick={() => setCurrentPage(number)}
                key={number}
                isDisabled={currentPage + 1 === number}
              >
                {number}
              </Button>
            );
          })}
          <IconButton
            icon={<Icon as={BsChevronRight} />}
            onClick={incrementCurrentPage}
            isDisabled={
              currentPage === wearerPages.count - 1 || _.isEmpty(wearers)
            }
          />
        </HStack>
      </Stack>
    </>
  );
}

export default HatWearers;
