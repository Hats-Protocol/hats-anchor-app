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
  Box,
} from '@chakra-ui/react';
import { useAccount, useEnsName } from 'wagmi';
import { BsChevronRight, BsChevronLeft } from 'react-icons/bs';

import Link from '../ChakraNextLink';
import { formatAddress } from '../../lib/general';
import HatWearerForm from '../../forms/HatWearerForm';
import Modal from '../Modal';
import { useOverlay } from '../../contexts/OverlayContext';
import { isAdmin, decimalId, isTopHat } from '../../lib/hats';
import useWearerDetails from '../../hooks/useWearerDetails';
import useHatBurn from '../../hooks/useHatBurn';
import { hatsAddresses } from '../../constants';

const WEARERS_PER_PAGE = 5;
// TODO clean up pagination

const WearerRow = ({ hatData, user, wearer, setModals }) => {
  const { data: ensName } = useEnsName({ address: wearer, chainId: 1 });

  return (
    <Flex
      borderBottom='1px solid'
      borderColor='gray.400'
      key={wearer}
      align='center'
      justify='space-between'
      p={1}
    >
      <Link href={`/wearers/${wearer}`} key={wearer}>
        <Text>{ensName || formatAddress(wearer)}</Text>
      </Link>

      <HStack spacing={6}>
        {user &&
          _.eq(_.toLower(user), _.toLower(wearer)) &&
          (!isTopHat(hatData) ? (
            <Button
              size='sm'
              variant='outline'
              onClick={() => setModals({ renounceConfirm: true })}
            >
              Renounce
            </Button>
          ) : (
            <Button onClick={() => setModals({ transferHat: true })} isDisabled>
              Transfer
            </Button>
          ))}
        <Link href={`/wearers/${wearer}`} key={wearer}>
          <Icon as={BsChevronRight} />
        </Link>
      </HStack>
    </Flex>
  );
};

function HatWearers({ hatData, chainId }) {
  const [currentPage, setCurrentPage] = useState(0);
  const wearers = _.get(hatData, 'wearers', []);
  const { address } = useAccount();
  const localOverlay = useOverlay();
  const { data: wearerData } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const { writeAsync: renounceHat } = useHatBurn({
    hatsAddress: hatsAddresses(chainId),
    chainId,
    hatId: decimalId(_.get(hatData, 'id')),
  });
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
    if (currentPage !== 0) setCurrentPage((curr) => curr - 1);
  };

  const incrementCurrentPage = () => {
    if (currentPage !== wearerPages.count) setCurrentPage((curr) => curr + 1);
  };

  const handleRenounceHat = async () => {
    await renounceHat();
  };

  return (
    <>
      <Modal name='newWearer' title='Mint Hat' localOverlay={localOverlay}>
        <HatWearerForm hatId={_.get(hatData, 'id')} chainId={chainId} />
      </Modal>
      <Modal
        name='renounceConfirm'
        title='Are you sure?'
        localOverlay={localOverlay}
      >
        <Stack>
          <Text>
            You are about to renounce (burn) your Hat with the following Hat ID:
          </Text>
          <Box bg='blackAlpha.200' p={4} borderRadius='md'>
            <Text fontFamily='monospace' fontSize='md'>
              {_.get(hatData, 'prettyId')}
            </Text>
          </Box>
          <Text>Are you sure you want to do this?</Text>
          <Flex justify='flex-end' w='100%'>
            <HStack>
              <Button
                onClick={() => setModals({ renounceConfirm: false })}
                variant='outline'
              >
                Cancel
              </Button>
              <Button onClick={handleRenounceHat}>
                Yes I&apos;m sure - Renounce
              </Button>
            </HStack>
          </Flex>
        </Stack>
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

          {address &&
            _.get(hatData, 'currentSupply') !== _.get(hatData, 'maxSupply') &&
            isAdmin(
              _.get(hatData, 'prettyId'),
              _.map(_.get(wearerData, 'currentHats'), 'prettyId'),
            ) && (
              <Button
                onClick={() => setModals({ newWearer: true })}
                variant='outline'
              >
                Mint to New Wearer
              </Button>
            )}
        </Flex>

        <Stack w='100%' minH='220px'>
          {_.isEmpty(wearers) ? (
            <Flex justify='center' my={6}>
              <Text>No wearers yet</Text>
            </Flex>
          ) : (
            wearerPages.pages?.[currentPage]?.map((wearer) => (
              <WearerRow
                hatData={hatData}
                wearer={wearer}
                user={address}
                setModals={setModals}
                key={wearer}
              />
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
                onClick={() => setCurrentPage(number - 1)}
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
              _.eq(currentPage, _.subtract(_.get(wearerPages, 'count'), 1)) ||
              _.isEmpty(wearers)
            }
          />
        </HStack>
      </Stack>
    </>
  );
}

export default HatWearers;
