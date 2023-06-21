/* eslint-disable no-plusplus */
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
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { BsChevronRight, BsChevronLeft } from 'react-icons/bs';
import { FaEllipsisV } from 'react-icons/fa';
import { useAccount, useEnsName } from 'wagmi';

import Link from '@/components/ChakraNextLink';
import Modal from '@/components/Modal';
import { useOverlay } from '@/contexts/OverlayContext';
import HatRenounceForm from '@/forms/HatRenounceForm';
import HatTransferForm from '@/forms/HatTransferForm';
import HatWearerForm from '@/forms/HatWearerForm';
import useHatWearerStatusCheck from '@/hooks/useHatWearerStatusCheck';
import { formatAddress } from '@/lib/general';
import {
  isMutable,
  isTopHat,
  isTopHatOrMutable,
  prettyIdToId,
  prettyIdToIp,
} from '@/lib/hats';
import { fetchAllTreesByIds } from '@/gql/helpers';

const WEARERS_PER_PAGE = 5;

const WearerRow = ({
  linkedTopHat = false,
  chainId,
  hatData,
  user,
  wearer,
  setModals,
  setWearerToTransferFrom,
  setHatToTransfer,
  isAdminUser,
}: WearerRowProps) => {
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
    <Flex
      borderBottom='1px solid'
      borderColor='gray.400'
      key={wearer}
      align='center'
      justify='space-between'
      p={1}
    >
      <Flex>
        {linkedTopHat && (
          <Text pr={2}>Linked hat #{prettyIdToIp(hatData.prettyId)}: </Text>
        )}
        <Link href={`/wearers/${wearer}`} key={wearer}>
          <Text>{ensName || formatAddress(wearer)}</Text>
        </Link>
      </Flex>

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
                    setHatToTransfer(hatData);
                    setModals({ transferHat: true });
                  }}
                  // is disabled if is not a top hat or mutable,
                  // but enabled if it is linked top hat and mutable
                  isDisabled={
                    !isTopHatOrMutable(hatData) &&
                    !(linkedTopHat && isMutable(hatData))
                  }
                >
                  <Tooltip
                    label={!isMutable(hatData) ? 'Hat is not mutable' : ''}
                    shouldWrapChildren
                    placement='left'
                    hasArrow
                    bg='gray.100'
                    color='black'
                  >
                    Transfer
                  </Tooltip>
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
                isDisabled={!checkEligibility || isLoadingHatWearerStatusCheck}
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
  );
};

interface WearerRowProps {
  linkedTopHat?: boolean;
  chainId: number;
  hatData: any;
  user: `0x${string}` | undefined;
  wearer: `0x${string}` | undefined;
  setModals: any;
  setWearerToTransferFrom: any;
  setHatToTransfer: any;
  isAdminUser: boolean;
}

function HatWearers({
  hatData,
  chainId,
  isAdminUser,
  parentOfTrees,
}: HatWearersProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [wearerToTransferFrom, setWearerToTransferFrom] = useState('');
  const [hatToTransfer, setHatToTransfer] = useState({});
  const wearers = _.get(hatData, 'wearers', []);
  const { address } = useAccount();
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const [allParentOfTrees, setAllParentOfTrees] = useState<any[]>([]);

  // need to move this into getStaticProps of hat
  useEffect(() => {
    const fetchParentOfTrees = async () => {
      const treeIds = parentOfTrees.map((tree) => prettyIdToId(tree.id));
      const parentTrees = await fetchAllTreesByIds(treeIds, chainId);
      setAllParentOfTrees(parentTrees);
    };

    if (parentOfTrees?.length > 0) {
      fetchParentOfTrees();
    }
  }, [parentOfTrees, chainId]);

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
      <Modal name='newWearer' title='Mint' localOverlay={localOverlay}>
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
                onClick={() => setModals?.({ newWearer: true })}
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
                setHatToTransfer={setHatToTransfer}
                isAdminUser={isAdminUser}
              />
            ))
          )}
          {allParentOfTrees?.map((hat) => (
            <WearerRow
              linkedTopHat
              chainId={chainId}
              hatData={hat}
              wearer={hat.wearers[0]?.id}
              user={address}
              setModals={setModals}
              key={hat.id}
              setWearerToTransferFrom={setWearerToTransferFrom}
              setHatToTransfer={setHatToTransfer}
              isAdminUser={isAdminUser}
            />
          ))}
        </Stack>

        <HStack spacing={3}>
          <IconButton
            icon={<Icon as={BsChevronLeft} />}
            onClick={decrementCurrentPage}
            isDisabled={currentPage === 0}
            aria-label='Previous page'
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
            aria-label='Next page'
          />
        </HStack>
      </Stack>
      <Modal
        name='transferHat'
        title='Transfer Hat to New Address'
        localOverlay={localOverlay}
      >
        <HatTransferForm
          id={_.get(hatToTransfer, 'id')}
          prettyId={_.get(hatToTransfer, 'prettyId')}
          chainId={chainId}
          currentWearerAddress={wearerToTransferFrom}
        />
      </Modal>
    </>
  );
}

export default HatWearers;

interface HatWearersProps {
  hatData: any;
  chainId: number;
  isAdminUser: boolean;
  parentOfTrees: any[];
}
