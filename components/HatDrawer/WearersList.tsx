/* eslint-disable no-nested-ternary */
import {
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
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
import { FaPlus, FaSearch } from 'react-icons/fa';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import Suspender from '@/components/atoms/Suspender';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatClaim from '@/hooks/useHatClaim';
import useModuleDetails from '@/hooks/useModuleDetails';
import useMultiClaimsHatterCheck from '@/hooks/useMultiClaimsHatterCheck';
import useMultiClaimsHatterContractWrite from '@/hooks/useMultiClaimsHatterContractWrite';
import useWearerDetails from '@/hooks/useWearerDetails';
import useWearerEligibilityCheck from '@/hooks/useWearerEligibilityCheck';
import useWearersEligibilityCheck from '@/hooks/useWearersEligibilityCheck';
import { isSameAddress } from '@/lib/general';
import { isWearingAdminHat } from '@/lib/hats';
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
  const { chainId, selectedHat, editMode } = useTreeForm();
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
  const wearerIds = useMemo(() => wearers.map(({ id }) => id), [wearers]);
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
        wearers,
      }),
    [wearersEligibility, wearers],
  );

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
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

  const sortWearers = useCallback(() => {
    if (address) {
      wearers?.sort((w1, w2) => {
        if (isSameAddress(w1.id, address)) return -1;
        if (isSameAddress(w2.id, address)) return 1;
        return 0;
      });
    }
  }, [address, wearers]);

  useEffect(() => {
    sortWearers();
  }, [sortWearers]);

  const filteredWearers = _.slice(
    filterWearers(searchTerm, wearers),
    0,
    6,
  ) as HatWearer[];
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
        <Flex justify='space-between'>
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

        <Flex justify='space-between' align='center'>
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
          {!!instanceAddress &&
            !!eligibilityDetails &&
            !_.includes(claimableHats, selectedHat?.id) &&
            isAdminUser && (
              <Button
                size='xs'
                variant='outline'
                colorScheme='blue'
                borderColor='blue.500'
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
          title='Hat Wearers'
          localOverlay={localOverlay}
        >
          <Flex direction='column' gap={4}>
            {wearers?.map((w: HatWearer) => (
              <WearerRow
                key={w.id}
                wearer={w}
                isEligible={_.includes(_.map(eligibleWearers, 'id'), w.id)}
                isAdminUser={isAdminUser}
                setChangeStatusWearer={setChangeStatusWearer}
                setWearerToTransferFrom={setWearerToTransferFrom}
              />
            ))}
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
