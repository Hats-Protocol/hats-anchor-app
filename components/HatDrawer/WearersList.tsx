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
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { FaFileCsv, FaPlus, FaSearch } from 'react-icons/fa';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import Suspender from '@/components/atoms/Suspender';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { wearersPerPage } from '@/gql/helpers';
import useHatClaim from '@/hooks/useHatClaim';
import useHatPaginatedWearers from '@/hooks/useHatPaginatedWearers';
import useWearerDetails from '@/hooks/useWearerDetails';
import useWearerEligibilityCheck from '@/hooks/useWearerEligibilityCheck';
import useWearersEligibilityCheck from '@/hooks/useWearersEligibilityCheck';
import { isSameAddress } from '@/lib/general';
import { exportToCsv, isWearingAdminHat } from '@/lib/hats';
import { filterWearers, getEligibleWearers } from '@/lib/wearers';
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
  const { chainId, selectedHat, selectedHatDetails } = useTreeForm();
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

  const {
    data: paginatedWearers,
    nextPage,
    prevPage,
    isLoading,
    isFetching,
    currentPage,
  } = useHatPaginatedWearers({
    hatId: selectedHat?.id,
    chainId,
    initialData: wearers,
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
    chainId,
  });

  const { data: currentUserIsEligible } = useWearerEligibilityCheck({
    wearer: address,
  });

  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaim({
    wearer: address,
  });

  const currentWearerHats = _.map(wearer, 'id');
  const isAdminUser = isWearingAdminHat(
    currentWearerHats,
    selectedHat?.id,
    true,
  );

  const sortWearers = useCallback(() => {
    wearers?.sort((w1, w2) => {
      // If the current user's address matches either w1 or w2, they should be prioritized.
      if (isSameAddress(w1.id, address)) return -1;
      if (isSameAddress(w2.id, address)) return 1;

      // If either wearer has an ENS name, sort by that.
      if (w1.ensName && w2.ensName) return w1.ensName.localeCompare(w2.ensName);
      if (w1.ensName) return -1;
      if (w2.ensName) return 1;

      // For 0x addresses: Sort based on their numerical value, then uppercase, then lowercase.
      const addr1Without0x = w1.id.slice(2);
      const addr2Without0x = w2.id.slice(2);

      const num1 = parseInt(addr1Without0x, 16);
      const num2 = parseInt(addr2Without0x, 16);

      if (num1 !== num2) return num1 - num2;

      const upperCaseRegex = /[A-F]/;
      const isUpper1 = upperCaseRegex.test(addr1Without0x);
      const isUpper2 = upperCaseRegex.test(addr2Without0x);

      if (isUpper1 && isUpper2) return w1.id.localeCompare(w2.id);
      if (isUpper1) return -1;
      if (isUpper2) return 1;

      // If none of the above, sort normally.
      return w1.id.localeCompare(w2.id);
    });
  }, [address, wearers]);

  useEffect(() => {
    sortWearers();
  }, [sortWearers]);

  const filteredWearers = useMemo(
    () => _.slice(filterWearers(searchTerm, wearers), 0, 6) as HatWearer[],
    [searchTerm, wearers],
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

        {_.gt(_.size(wearers), 5) && (
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

        <Flex justify='space-between' alignItems='center'>
          {_.gt(_.size(wearers), 6) && (
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
          {(currentUserIsEligible as boolean) &&
            !!isClaimable &&
            !currentUserIsWearing && (
              <Tooltip label={claimTooltip} fontSize='md' shouldWrapChildren>
                <Button
                  variant='unstyled'
                  isDisabled={
                    !claimHat || !hatterIsAdmin || chainId !== currentNetworkId
                  }
                  onClick={() => {
                    claimHat?.();
                  }}
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
                onClick={() => exportToCsv(wearers, selectedHatDetails?.name)}
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
                isDisabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant='ghost'
                onClick={() => {
                  nextPage();
                }}
                isDisabled={_.size(paginatedWearers) < wearersPerPage}
              >
                Next
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
