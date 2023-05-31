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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
} from '@chakra-ui/react';
import { useAccount, useEnsName } from 'wagmi';
import { BsChevronRight, BsChevronLeft } from 'react-icons/bs';
import { FaEllipsisV } from 'react-icons/fa';

import Link from '@/components/ChakraNextLink';
import { formatAddress } from '@/lib/general';
import HatTransferForm from '@/forms/HatTransferForm';
import HatWearerForm from '@/forms/HatWearerForm';
import { useOverlay } from '@/contexts/OverlayContext';
import { isTopHat, isTopHatOrMutable } from '@/lib/hats';
import HatWearerStatusForm from '@/forms/HatWearerStatusForm';
import HatRenounceForm from '@/forms/HatRenounceForm';
import useHatWearerStatusCheck from '@/hooks/useHatWearerStatusCheck';
import Modal from '@/components/Modal';

const WEARERS_PER_PAGE = 5;

const WearerRow = ({
  chainId,
  hatData,
  user,
  wearer,
  setModals,
  setWearerToTransferFrom,
  isAdminUser,
}) => {
  const localOverlay = useOverlay();
  const { data: ensName } = useEnsName({
    address: wearer,
    chainId: 1,
  });

  const {
    writeAsync: checkEligibility,
    isLoading: isLoadingHatWearerStatusCheck,
  } = useHatWearerStatusCheck({
    hatData,
    wearerAddress: wearer,
    chainId,
  });

  const handleCheckEligibility = async () => {
    await checkEligibility?.();
  };

  return (
    <>
      <Modal
        name={`wearerStatus-${wearer}`}
        title='Change Wearer Status'
        localOverlay={localOverlay}
      >
        <HatWearerStatusForm
          defaultValues={{
            wearer,
            eligibility: 'Ineligible',
            standing: 'Bad Standing',
          }}
          hatData={hatData}
          chainId={_.get(hatData, 'chainId')}
        />
      </Modal>

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
          {user ? (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<Icon as={FaEllipsisV} h='12px' w='12px' />}
                minW='auto'
                w={8}
                h={8}
                variant='ghost'
              />
              <MenuList>
                <MenuItem as={Link} href={`/wearers/${wearer}`}>
                  View Profile
                </MenuItem>
                {_.eq(_.toLower(user), _.toLower(wearer)) &&
                  !isTopHat(hatData) && (
                    <MenuItem
                      onClick={() => setModals({ renounceConfirm: true })}
                    >
                      Renounce
                    </MenuItem>
                  )}
                {isAdminUser && (
                  <MenuItem
                    onClick={() => {
                      setWearerToTransferFrom(wearer);
                      setModals({ transferHat: true });
                    }}
                    isDisabled={!isTopHatOrMutable(hatData)}
                  >
                    Transfer
                  </MenuItem>
                )}
                {/* {isAdmin(
                _.get(hatData, 'prettyId'),
                _.map(_.get(currentUser, 'currentHats'), 'prettyId'),
              ) && (
                <MenuItem onClick={() => setModals({ removeWearer: true })}>
                  Remove
                </MenuItem>
              )} */}
                {_.eq(
                  _.toLower(user),
                  _.toLower(_.get(hatData, 'eligibility')),
                ) && (
                  <MenuItem
                    onClick={() =>
                      setModals({ [`wearerStatus-${wearer}`]: true })
                    }
                  >
                    Revoke
                  </MenuItem>
                )}
                <MenuItem
                  isDisabled={
                    !checkEligibility || isLoadingHatWearerStatusCheck
                  }
                  onClick={handleCheckEligibility}
                >
                  <Tooltip
                    label={
                      !checkEligibility ? 'Eligibility is not a contract' : ''
                    }
                    placement='left'
                    hasArrow
                    bg='gray.100'
                    color='black'
                  >
                    Check Eligibility
                  </Tooltip>
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link href={`/wearers/${wearer}`} key={wearer}>
              <Icon as={BsChevronRight} />
            </Link>
          )}
        </HStack>
      </Flex>
    </>
  );
};

function HatWearers({ hatData, chainId, isAdminUser }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [wearerToTransferFrom, setWearerToTransferFrom] = useState('');
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
    if (currentPage !== 0) setCurrentPage((curr) => curr - 1);
  };

  const incrementCurrentPage = () => {
    if (currentPage !== wearerPages.count) setCurrentPage((curr) => curr + 1);
  };

  return (
    <>
      <Modal name='newWearer' title='Batch Mint' localOverlay={localOverlay}>
        <HatWearerForm
          hatId={_.get(hatData, 'id')}
          chainId={chainId}
          currentWearers={_.map(wearers, 'id')}
          maxSupply={_.get(hatData, 'maxSupply')}
        />
      </Modal>
      <Modal
        name='renounceConfirm'
        title='Are you sure?'
        localOverlay={localOverlay}
      >
        <HatRenounceForm hatData={hatData} />
      </Modal>

      <Stack align='center' spacing={4}>
        <Flex justify='space-between' w='100%'>
          <Text>
            {_.get(hatData, 'currentSupply')} Worn /{' '}
            {_.get(hatData, 'maxSupply')} Max Supply
          </Text>

          {address &&
            _.get(hatData, 'currentSupply') !== _.get(hatData, 'maxSupply') &&
            isAdminUser && (
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
                chainId={chainId}
                hatData={hatData}
                wearer={wearer}
                user={address}
                setModals={setModals}
                key={wearer}
                setWearerToTransferFrom={setWearerToTransferFrom}
                isAdminUser={isAdminUser}
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
      <Modal
        name='transferHat'
        title='Transfer Hat to New Address'
        localOverlay={localOverlay}
      >
        <HatTransferForm
          hatData={hatData}
          chainId={chainId}
          currentWearerAddress={wearerToTransferFrom}
        />
      </Modal>
    </>
  );
}

export default HatWearers;
