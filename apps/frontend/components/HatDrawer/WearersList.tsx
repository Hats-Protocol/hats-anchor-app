/* eslint-disable no-nested-ternary */
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { commify, extendWearers, wearersPerPage } from 'app-utils';
import {
  useAllWearers,
  useHatClaim,
  useHatPaginatedWearers,
  useModuleDetails,
  useMultiClaimsHatterCheck,
  useMultiClaimsHatterContractWrite,
  useWearerDetails,
  useWearerEligibilityCheck,
  useWearersEligibilityCheck,
} from 'hats-hooks';
import { HatWearer } from 'hats-types';
import {
  exportToCsv,
  filterWearers,
  getEligibleWearers,
  isWearingAdminHat,
  maxSupplyText,
  // sortWearers,
} from 'hats-utils';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaFileCsv, FaPlus, FaSearch } from 'react-icons/fa';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import { useOverlay } from '../../contexts/OverlayContext';
import { useTreeForm } from '../../contexts/TreeFormContext';
import Suspender from '../atoms/Suspender';
import WearerRow from './WearerRow';

const Modal = dynamic(() => import('../atoms/Modal'), {
  loading: () => <Suspender />,
});
const HatTransferForm = dynamic(() => import('../../forms/HatTransferForm'), {
  loading: () => <Suspender />,
});
const HatWearerForm = dynamic(() => import('../../forms/HatWearerForm'), {
  loading: () => <Suspender />,
});
const HatWearerStatusForm = dynamic(
  () => import('../../forms/HatWearerStatusForm'),
  {
    loading: () => <Suspender />,
  },
);

const WearersList = () => {
  const currentNetworkId = useChainId();
  const { address } = useAccount();
  const localOverlay = useOverlay();
  const { setModals, modals } = localOverlay;
  const {
    chainId,
    selectedHat,
    selectedHatDetails,
    editMode,
    wearersAndControllers,
    onchainHats,
    storedData,
  } = useTreeForm();
  const [changeStatusWearer, setChangeStatusWearer] = useState<
    Hex | undefined
  >();
  const [wearerToTransferFrom, setWearerToTransferFrom] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const localForm = useForm({
    mode: 'onBlur',
  });

  const maxSupply = _.toNumber(_.get(selectedHat, 'maxSupply', 0));
  const extendedWearers = extendWearers(
    _.get(selectedHat, 'wearers'),
    wearersAndControllers,
  );

  const { wearers: exportWearers } = useAllWearers({
    selectedHat,
    chainId,
    enabled: _.get(modals, 'hatWearers'),
  });

  const {
    paginatedWearers,
    nextPage,
    prevPage,
    isLoading,
    isFetching,
    currentPage,
  } = useHatPaginatedWearers({
    hatId: selectedHat?.id,
    chainId,
    editMode,
  });

  const mergedWearers = _.merge(extendedWearers, paginatedWearers);
  const wearerIds = useMemo(() => _.map(exportWearers, 'id'), [exportWearers]);
  const currentUserIsWearing = useMemo(
    () => _.includes(wearerIds, _.toLower(address)),
    [wearerIds, address],
  );
  const { data: wearersEligibility } = useWearersEligibilityCheck({
    wearerIds,
    selectedHat,
    chainId,
  });

  const eligibleWearers = useMemo(
    () =>
      getEligibleWearers({
        wearersEligibility,
        wearers: mergedWearers,
      }),
    [wearersEligibility, mergedWearers],
  );

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
    editMode,
  });

  const { data: currentUserIsEligible } = useWearerEligibilityCheck({
    wearer: address,
    selectedHat,
    chainId,
  });

  const { instanceAddress, claimableHats } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    onchainHats,
    storedData,
    editMode,
  });
  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaim({
    selectedHat,
    chainId,
    wearer: address,
  });
  const { details: eligibilityDetails } = useModuleDetails({
    address: selectedHat?.eligibility as Hex,
    chainId,
  });

  const isAdminUser = isWearingAdminHat(_.map(wearer, 'id'), selectedHat?.id);

  const {
    writeAsync: setHatClaimability,
    isLoading: isLoadingSetHatClaimability,
  } = useMultiClaimsHatterContractWrite({
    functionName: 'setHatClaimability',
    address: instanceAddress,
    chainId,
    enabled: !!instanceAddress && isAdminUser,
    args: [selectedHat?.id, 1],
  });

  const filteredWearers = useMemo(() => {
    if (!extendedWearers) return undefined;
    return _.slice(
      filterWearers(searchTerm, extendedWearers),
      0,
      6,
    ) as HatWearer[];
  }, [searchTerm, extendedWearers]);

  const maxWearersReached = _.gte(_.size(extendedWearers), maxSupply);

  const claimTooltip = useMemo(() => {
    if (chainId !== currentNetworkId)
      return "You can't claim a hat on a different chain.";
    if (!hatterIsAdmin)
      return 'Hatter must be wearing an admin hat to claim this hat.';
    return undefined;
  }, [chainId, currentNetworkId, hatterIsAdmin]);

  return (
    <>
      <Stack spacing={4}>
        <Flex justify='space-between' alignItems='center'>
          <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
            Hat Wearers
          </Heading>

          <Flex gap={1}>
            <Text>{_.get(selectedHat, 'currentSupply')}</Text>
            <HStack color='gray.400' spacing={1}>
              <Text>of</Text>
              <Tooltip
                label={maxSupply && commify(maxSupply)}
                placement='left'
                hasArrow
              >
                <Text fontFamily='mono'>{maxSupplyText(maxSupply)}</Text>
              </Tooltip>
            </HStack>
          </Flex>
        </Flex>

        {_.gt(_.size(extendedWearers), 5) && (
          <InputGroup>
            <InputLeftElement pointerEvents='none'>
              <FaSearch />
            </InputLeftElement>
            <Input
              // add left icon inside of input field
              placeholder='Find by address (0x) or ens (.eth)'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        )}
        {/* Wearers list */}
        {_.map(filteredWearers, (w: HatWearer) => (
          <WearerRow
            key={w.id}
            wearer={w}
            isEligible={
              !_.isEmpty(eligibleWearers)
                ? _.includes(_.map(eligibleWearers, 'id'), w.id)
                : true
            }
            setChangeStatusWearer={setChangeStatusWearer}
            setWearerToTransferFrom={setWearerToTransferFrom}
          />
        ))}
        {_.isEmpty(filteredWearers) && (
          <Box>
            <Flex justify='center' h='70px' align='center'>
              <Text>No wearers currently</Text>
            </Flex>
            <Divider />
          </Box>
        )}

        <Flex justify='space-between' align='center'>
          {_.gt(_.size(extendedWearers), 6) && (
            <Text
              onClick={() => setModals?.({ hatWearers: true })}
              cursor='pointer'
              _hover={{
                textDecor: 'underline',
              }}
            >
              Show all {_.get(selectedHat, 'currentSupply')} wearers
            </Text>
          )}
          {!!instanceAddress &&
            !!eligibilityDetails &&
            !_.includes(claimableHats, selectedHat?.id) &&
            isAdminUser && (
              <Button
                size='xs'
                variant='outline'
                colorScheme='blue.500'
                onClick={setHatClaimability}
                isLoading={isLoadingSetHatClaimability}
                isDisabled={isLoadingSetHatClaimability || !setHatClaimability}
              >
                Set hat for claiming
              </Button>
            )}
          {(currentUserIsEligible as boolean) &&
            !!isClaimable &&
            !currentUserIsWearing && (
              <Tooltip label={claimTooltip} fontSize='md' shouldWrapChildren>
                <Button
                  variant='unstyled'
                  isDisabled={
                    !claimHat || !hatterIsAdmin || chainId !== currentNetworkId
                  }
                  onClick={claimHat}
                >
                  <HStack color='blue.500'>
                    <FaPlus />
                    <Text>Claim Hat</Text>
                  </HStack>
                </Button>
              </Tooltip>
            )}
          {isAdminUser && (
            <Tooltip
              label={
                maxWearersReached
                  ? 'Maximum number of wearers reached.'
                  : chainId !== currentNetworkId
                  ? "You can't add a wearer on a different chain."
                  : ''
              }
              fontSize='md'
              isDisabled={!maxWearersReached && chainId === currentNetworkId}
              shouldWrapChildren
            >
              <Button
                variant='unstyled'
                isDisabled={maxWearersReached || chainId !== currentNetworkId}
                onClick={() =>
                  !maxWearersReached ? setModals?.({ newWearer: true }) : {}
                }
              >
                <HStack
                  cursor={maxWearersReached ? 'not-allowed' : 'pointer'}
                  color={maxWearersReached ? 'gray.500' : 'blue.500'}
                >
                  <FaPlus />
                  <Text variant='ghost'>Add a wearer</Text>
                </HStack>
              </Button>
            </Tooltip>
          )}
        </Flex>
      </Stack>

      <Modal
        name='hatWearers'
        localOverlay={localOverlay}
        customHeader={
          <Flex
            justify='space-between'
            alignItems='center'
            mt={8}
            px={6}
            pb={4}
          >
            <Heading fontSize='24px'>Hat Wearers</Heading>
            <Button
              onClick={() =>
                exportWearers &&
                exportToCsv(exportWearers, selectedHatDetails?.name)
              }
              leftIcon={<FaFileCsv />}
              colorScheme='blue'
            >
              Export
            </Button>
          </Flex>
        }
        footer={
          <Flex justify='center' px={6} pb={6} w='full'>
            <Button
              variant='ghost'
              onClick={() => {
                prevPage();
              }}
              isDisabled={currentPage === 0}
            >
              {currentPage > 1 ? `Previous (${currentPage - 1})` : 'Previous'}
            </Button>
            <Button
              variant='ghost'
              onClick={() => {
                nextPage();
              }}
              isDisabled={_.size(paginatedWearers) < wearersPerPage}
            >
              {`Next (${currentPage + 1})`}
            </Button>
          </Flex>
        }
      >
        <Flex direction='column' gap={4}>
          {isLoading || isFetching ? (
            <Spinner />
          ) : (
            paginatedWearers?.map((w: HatWearer) => (
              <WearerRow
                key={w.id}
                wearer={w}
                isEligible={_.includes(_.map(eligibleWearers, 'id'), w.id)}
                setChangeStatusWearer={setChangeStatusWearer}
                setWearerToTransferFrom={setWearerToTransferFrom}
              />
            ))
          )}
        </Flex>
      </Modal>

      <Modal
        name='hatWearerStatus'
        title='Remove a Wearer by revoking their Hat token'
        localOverlay={localOverlay}
        size='3xl'
      >
        <HatWearerStatusForm
          wearer={changeStatusWearer}
          eligibility='Not Eligible'
        />
      </Modal>

      <Modal
        name='transferHat'
        title='Transfer Hat to New Address'
        localOverlay={localOverlay}
      >
        <HatTransferForm currentWearerAddress={wearerToTransferFrom} />
      </Modal>

      <Modal
        name='newWearer'
        title='Add a Wearer by minting a Hat token'
        localOverlay={localOverlay}
      >
        <HatWearerForm localForm={localForm} />
      </Modal>
    </>
  );
};

export default WearersList;
