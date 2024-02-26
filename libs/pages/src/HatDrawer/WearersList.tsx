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
import { useOverlay, useTreeForm } from 'contexts';
import {
  HatClaimForForm,
  HatTransferForm,
  HatWearerForm,
  HatWearerStatusForm,
} from 'forms';
import {
  useAllWearers,
  useHatClaimBy,
  useHatPaginatedWearers,
  useMultiClaimsHatterCheck,
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
} from 'hats-utils';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaFileCsv, FaPlus, FaSearch } from 'react-icons/fa';
import { commify, extendWearers, wearersPerPage } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import WearerRow from './WearerRow';

const Modal = dynamic(() => import('ui').then((mod) => mod.Modal));

const claimTooltip = ({
  claimFor,
  sameChain,
  hatterIsAdmin,
}: {
  claimFor: boolean;
  sameChain: boolean;
  hatterIsAdmin: boolean;
}) => {
  if (!sameChain)
    return claimFor
      ? "You can't claim this hat for a wearer from a different chain"
      : "You can't claim a hat from a different chain.";
  if (!hatterIsAdmin)
    return claimFor
      ? 'Hatter must be wearing an admin hat to claim this hat for a wearer.'
      : 'Hatter must be wearing an admin hat to claim this hat.';
  return undefined;
};

const addWearerTooltip = (sameChain, maxWearersReached) => {
  if (!sameChain) return "You can't add a wearer from a different chain.";
  if (maxWearersReached) return 'Maximum number of wearers reached.';

  return undefined;
};

const WearersList = () => {
  const currentNetworkId = useChainId();
  const { address } = useAccount();
  const localOverlay = useOverlay();
  const { isMobile } = useMediaStyles();
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

  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaimBy({
    selectedHat,
    chainId,
    wearer: address,
  });

  const { currentHatIsClaimable } = useMultiClaimsHatterCheck({
    selectedHat,
    chainId,
    onchainHats,
    editMode,
    storedData,
  });

  const isAdminUser = isWearingAdminHat(_.map(wearer, 'id'), selectedHat?.id);

  const filteredWearers = useMemo(() => {
    if (!extendedWearers) return undefined;
    return _.slice(
      filterWearers(searchTerm, extendedWearers),
      0,
      6,
    ) as HatWearer[];
  }, [searchTerm, extendedWearers]);

  const maxWearersReached = _.gte(_.size(extendedWearers), maxSupply);

  return (
    <>
      <Stack spacing={4} px={{ base: 4, md: 10 }}>
        <Flex justify='space-between' alignItems='center'>
          <HStack spacing={1}>
            <Heading size={{ base: 'sm', md: 'md' }} variant='medium'>
              {_.get(selectedHat, 'currentSupply')} Wearer
              {(_.toNumber(_.get(selectedHat, 'currentSupply')) > 1 ||
                _.toNumber(_.get(selectedHat, 'currentSupply')) === 0) &&
                's'}{' '}
              of this Hat
            </Heading>
            <Tooltip
              label={maxSupply && commify(maxSupply)}
              placement='left'
              hasArrow
            >
              <Text size='sm' color='blackAlpha.500'>
                of {maxSupplyText(maxSupply)} max
              </Text>
            </Tooltip>
          </HStack>
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
              size={{ base: 'sm', md: 'md' }}
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
              size={{ base: 'sm', md: 'md' }}
            >
              Show all {_.get(selectedHat, 'currentSupply')} wearers
            </Text>
          )}
          {!isMobile && (
            <>
              {currentHatIsClaimable?.for && address && (
                <Tooltip
                  label={claimTooltip({
                    claimFor: true,
                    sameChain: chainId === currentNetworkId,
                    hatterIsAdmin,
                  })}
                  fontSize='md'
                  shouldWrapChildren
                >
                  <Button
                    variant='unstyled'
                    isDisabled={
                      maxWearersReached ||
                      !hatterIsAdmin ||
                      chainId !== currentNetworkId
                    }
                    isLoading={isLoading}
                    onClick={() =>
                      !maxWearersReached ? setModals?.({ claimFor: true }) : {}
                    }
                  >
                    <HStack color='blue.500'>
                      <FaPlus />
                      <Text>Claim hat for wearer</Text>
                    </HStack>
                  </Button>
                </Tooltip>
              )}
              {(currentUserIsEligible as boolean) &&
                !!isClaimable &&
                !currentUserIsWearing && (
                  <Tooltip
                    label={claimTooltip({
                      claimFor: false,
                      sameChain: chainId === currentNetworkId,
                      hatterIsAdmin,
                    })}
                    fontSize='md'
                    shouldWrapChildren
                  >
                    <Button
                      variant='unstyled'
                      isDisabled={
                        !claimHat ||
                        maxWearersReached ||
                        !hatterIsAdmin ||
                        chainId !== currentNetworkId
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
                  label={addWearerTooltip(
                    chainId === currentNetworkId,
                    maxWearersReached,
                  )}
                  fontSize='md'
                  isDisabled={
                    !maxWearersReached && chainId === currentNetworkId
                  }
                  shouldWrapChildren
                >
                  <Button
                    variant='unstyled'
                    isDisabled={
                      maxWearersReached || chainId !== currentNetworkId
                    }
                    onClick={() =>
                      !maxWearersReached ? setModals?.({ newWearer: true }) : {}
                    }
                  >
                    <HStack
                      cursor={maxWearersReached ? 'not-allowed' : 'pointer'}
                      color={maxWearersReached ? 'gray.500' : 'blue.500'}
                    >
                      <FaPlus />
                      <Text>Add a wearer</Text>
                    </HStack>
                  </Button>
                </Tooltip>
              )}
            </>
          )}
        </Flex>
      </Stack>

      {!isMobile && (
        <>
          <Modal
            name='claimFor'
            title='Claim hat for wearer'
            size='2xl'
            localOverlay={localOverlay}
          >
            <HatClaimForForm />
          </Modal>

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
                <Heading size='2xl'>Hat Wearers</Heading>
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
                  {currentPage > 1
                    ? `Previous (${currentPage - 1})`
                    : 'Previous'}
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
      )}
    </>
  );
};

export default WearersList;
