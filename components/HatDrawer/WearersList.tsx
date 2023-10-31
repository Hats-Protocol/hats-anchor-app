/* eslint-disable no-nested-ternary */
import {
  Button,
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
import _ from 'lodash';
import { lazy, Suspense, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaFileCsv, FaPlus, FaSearch } from 'react-icons/fa';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import Suspender from '@/components/atoms/Suspender';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { wearersPerPage } from '@/gql/helpers';
import useAllWearers from '@/hooks/useAllWearers';
import useHatClaim from '@/hooks/useHatClaim';
import useHatPaginatedWearers from '@/hooks/useHatPaginatedWearers';
import useModuleDetails from '@/hooks/useModuleDetails';
import useMultiClaimsHatterCheck from '@/hooks/useMultiClaimsHatterCheck';
import useMultiClaimsHatterContractWrite from '@/hooks/useMultiClaimsHatterContractWrite';
import useWearerDetails from '@/hooks/useWearerDetails';
import useWearerEligibilityCheck from '@/hooks/useWearerEligibilityCheck';
import useWearersEligibilityCheck from '@/hooks/useWearersEligibilityCheck';
import { exportToCsv, isWearingAdminHat } from '@/lib/hats';
import { filterWearers, getEligibleWearers, sortWearers } from '@/lib/wearers';
import { HatWearer } from '@/types';

import WearerRow from './WearerRow';

const Modal = lazy(() => import('@/components/atoms/Modal'));
const HatTransferForm = lazy(() => import('@/forms/HatTransferForm'));
const HatWearerForm = lazy(() => import('@/forms/HatWearerForm'));
const HatWearerStatusForm = lazy(() => import('@/forms/HatWearerStatusForm'));

const WearersList = () => {
  const currentNetworkId = useChainId();
  const { address } = useAccount();
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { chainId, selectedHat, selectedHatDetails, editMode } = useTreeForm();
  const [changeStatusWearer, setChangeStatusWearer] = useState<
    Hex | undefined
  >();
  const [wearerToTransferFrom, setWearerToTransferFrom] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const localForm = useForm({
    mode: 'onBlur',
  });

  const maxSupply = _.get(selectedHat, 'maxSupply', 0);
  const wearers = useMemo(() => {
    return _.get(selectedHat, 'extendedWearers', []);
  }, [selectedHat]);

  const { wearers: exportWearers } = useAllWearers();

  const sortedWearers = useMemo(
    () => sortWearers({ wearers, address }),
    [wearers, address],
  );

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
  });

  const mergedWearers = _.merge(wearers, paginatedWearers);
  const wearerIds = (mergedWearers || []).map(({ id }) => id);
  const currentUserIsWearing = useMemo(
    () => _.includes(wearerIds, _.toLower(address)),
    [wearerIds, address],
  );
  const { data: wearersEligibility } = useWearersEligibilityCheck({
    wearerIds,
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
    editMode,
  });

  const { data: currentUserIsEligible } = useWearerEligibilityCheck({
    wearer: address,
  });

  const { instanceAddress, claimableHats } = useMultiClaimsHatterCheck();
  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaim({
    wearer: address,
  });
  const { details: eligibilityDetails } = useModuleDetails({
    address: selectedHat?.eligibility,
  });

  const { deploy: setHatClaimability, isLoading: isLoadingSetHatClaimability } =
    useMultiClaimsHatterContractWrite({
      functionName: 'setHatClaimability',
      address: instanceAddress,
      enabled: !!instanceAddress,
      args: [selectedHat?.id, 1],
    });

  const currentWearerHats = _.map(wearer, 'id');
  const isAdminUser = isWearingAdminHat(
    currentWearerHats,
    selectedHat?.id,
    true,
  );

  const filteredWearers = useMemo(
    () =>
      _.slice(filterWearers(searchTerm, sortedWearers), 0, 6) as HatWearer[],
    [searchTerm, sortedWearers],
  );

  const maxWearersReached = _.gte(_.size(wearers), maxSupply);

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
            <Text color='gray.400'>of {maxSupply}</Text>
          </Flex>
        </Flex>

        {_.gt(_.size(sortedWearers), 5) && (
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
        {filteredWearers.map((w: HatWearer) => (
          <WearerRow
            key={w.id}
            wearer={w}
            isEligible={_.includes(_.map(eligibleWearers, 'id'), w.id)}
            isAdminUser={isAdminUser}
            setChangeStatusWearer={setChangeStatusWearer}
            setWearerToTransferFrom={setWearerToTransferFrom}
          />
        ))}

        <Flex justify='space-between' align='center'>
          {_.gt(_.size(sortedWearers), 6) && (
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
                isDisabled={isLoadingSetHatClaimability}
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
                    <Text variant='ghost'>Claim Hat</Text>
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

      <Suspense fallback={<Suspender />}>
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
                  isAdminUser={isAdminUser}
                  setChangeStatusWearer={setChangeStatusWearer}
                  setWearerToTransferFrom={setWearerToTransferFrom}
                />
              ))
            )}
          </Flex>
        </Modal>
      </Suspense>

      <Suspense fallback={<Suspender />}>
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
      </Suspense>

      <Suspense fallback={<Suspender />}>
        <Modal
          name='transferHat'
          title='Transfer Hat to New Address'
          localOverlay={localOverlay}
        >
          <HatTransferForm currentWearerAddress={wearerToTransferFrom} />
        </Modal>
      </Suspense>

      <Suspense fallback={<Suspender />}>
        <Modal
          name='newWearer'
          title='Add a Wearer by minting a Hat token'
          localOverlay={localOverlay}
        >
          <HatWearerForm localForm={localForm} />
        </Modal>
      </Suspense>
    </>
  );
};

export default WearersList;
