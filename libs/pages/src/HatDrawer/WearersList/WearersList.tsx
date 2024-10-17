'use client';

import {
  Box,
  Button,
  Collapse,
  Flex,
  Heading,
  HStack,
  Icon,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { Modal, useSelectedHat, useTreeForm } from 'contexts';
import {
  HatClaimForm,
  HatTransferForm,
  HatWearerForm,
  HatWearerStatusForm,
} from 'forms';
import { useWearerDetails, useWearersEligibilityStatus } from 'hats-hooks';
import {
  filterWearers,
  isTopHat,
  isWearingAdminHat,
  sortWearers,
} from 'hats-utils';
import { useMediaStyles } from 'hooks';
import {
  filter,
  find,
  get,
  includes,
  isEmpty,
  map,
  pick,
  size,
  slice,
  toLower,
  toNumber,
  toString,
} from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ControllerData, HatWearer } from 'types';
import { commify, formatScientificWhole } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import WearerButtons from './WearerButtons';
import WearerRow from './WearerRow';
import FullWearersListModal from './WearersModal';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

const DEFAULT_WEARERS = {
  eligibleWearers: undefined,
  ineligibleWearers: undefined,
};

const WearersList = () => {
  const { isMobile } = useMediaStyles();
  const { address } = useAccount();
  const { editMode, orgChartWearers } = useTreeForm();
  const { selectedHat, chainId, hatLoading } = useSelectedHat();
  const {
    isOpen: ineligibleWearersExpanded,
    onToggle: onToggleIneligibleWearers,
  } = useDisclosure();

  const { data: wearersEligibility, isLoading: wearerEligibilityLoading } =
    useWearersEligibilityStatus({
      selectedHat,
      chainId,
      editMode,
    });
  const { eligibleWearers, ineligibleWearers } = useMemo(() => {
    if (wearerEligibilityLoading) return DEFAULT_WEARERS;
    const {
      eligibleWearers: eligibleWearerIds,
      ineligibleWearers: ineligibleWearerIds,
    } = pick(wearersEligibility, ['eligibleWearers', 'ineligibleWearers']);
    const localEligibleWearers = filter(orgChartWearers, (w: HatWearer) =>
      includes(eligibleWearerIds, w?.id),
    );
    const localIneligibleWearers = filter(orgChartWearers, (w: HatWearer) =>
      includes(ineligibleWearerIds, w?.id),
    );
    return {
      eligibleWearers: localEligibleWearers as HatWearer[],
      ineligibleWearers: localIneligibleWearers as HatWearer[],
    };
  }, [wearersEligibility, orgChartWearers, wearerEligibilityLoading]);

  const [changeStatusWearer, setChangeStatusWearer] = useState<
    Hex | undefined
  >();
  const [wearerToTransferFrom, setWearerToTransferFrom] = useState('');
  const [searchTerm] = useState('');
  const localForm = useForm({
    mode: 'onBlur',
  });

  const maxSupply = toNumber(get(selectedHat, 'maxSupply', 0));
  // const extendedWearers = extendWearers(
  //   _.get(selectedHat, 'wearers'),
  //   hatWearers,
  // );

  const filteredWearers = useMemo(() => {
    const sortedWearers = sortWearers({
      wearers: eligibleWearers,
      address: address as Hex,
    });
    return slice(filterWearers(searchTerm, sortedWearers), 0, 4) as HatWearer[];
  }, [searchTerm, eligibleWearers, address]);
  const loadingWearers = Array(4).fill({});

  const { data: wearerDetails } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });
  const currentUserIsAdmin = isWearingAdminHat(
    map(wearerDetails, 'id'),
    selectedHat?.id,
    !!isTopHat(selectedHat),
  );
  const currentUserIsWearing = includes(
    map(wearerDetails, 'id'),
    selectedHat?.id,
  );
  const currentWearerDetails = find(orgChartWearers, {
    id: toLower(address),
  }) as ControllerData;
  const currentUserInList = includes(
    map(filteredWearers, 'id'),
    toLower(address),
  );
  const currentUserIsIneligible = includes(
    map(ineligibleWearers, 'id'),
    toLower(address),
  );

  // TODO fetch additional details if wearer not found in orgChartWearers
  // console.log({ currentWearerDetails });

  return (
    <>
      <Stack>
        <Stack spacing={4} px={{ base: 4, md: 16 }}>
          <Flex justify='space-between' alignItems='center'>
            <HStack spacing={1}>
              <Skeleton isLoaded={!!eligibleWearers}>
                <Heading variant={{ base: 'medium', md: 'default' }} size='md'>
                  {get(selectedHat, 'currentSupply')}{' '}
                  {toNumber(get(selectedHat, 'currentSupply')) === 1
                    ? 'Wearer'
                    : 'Wearers'}{' '}
                  of this Hat
                </Heading>
              </Skeleton>
              <Tooltip
                label={
                  maxSupply &&
                  formatScientificWhole(maxSupply) !== toString(maxSupply) &&
                  commify(maxSupply)
                }
                placement='left'
                hasArrow
              >
                <Text size='sm' color='blackAlpha.500'>
                  of {formatScientificWhole(maxSupply)} max
                </Text>
              </Tooltip>
            </HStack>
          </Flex>
          {/* TEMP HIDDEN SINCE FETCHING INCOMPLETE LIST OF WEARERS */}
          {/* {_.gt(_.size(extendedWearers), 4) && (
            <InputGroup>
              <InputLeftElement pointerEvents='none'>
                <FaSearch />
              </InputLeftElement>
              <Input
                // add left icon inside of input field
                placeholder='Find by address (0x) or ens (.eth)'
                variant='filled'
                _focus={{
                  bg: 'white',
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          )} */}
          {/* Wearers list */}

          {currentUserIsWearing &&
            !currentUserInList &&
            !currentUserIsIneligible && (
              <WearerRow
                wearer={currentWearerDetails || { id: address as Hex }}
                setChangeStatusWearer={setChangeStatusWearer}
                setWearerToTransferFrom={setWearerToTransferFrom}
              />
            )}
          {map(
            !hatLoading ? filteredWearers : loadingWearers,
            (w: HatWearer, index: number) => (
              <Skeleton isLoaded={typeof w.id === 'string'} key={index}>
                <WearerRow
                  wearer={w}
                  currentUserIsAdmin={currentUserIsAdmin}
                  setChangeStatusWearer={setChangeStatusWearer}
                  setWearerToTransferFrom={setWearerToTransferFrom}
                />
              </Skeleton>
            ),
          )}
          {!hatLoading && isEmpty(filteredWearers) && (
            <Box>
              <Flex h='70px' align='center'>
                <Text>No wearers currently</Text>
              </Flex>
              {/* <Divider /> */}
            </Box>
          )}
        </Stack>
        {!isEmpty(ineligibleWearers) && (
          <Collapse startingHeight={25} in={ineligibleWearersExpanded}>
            <Stack px={{ base: 4, md: 16 }}>
              <Flex justify='space-between'>
                <HStack spacing={1} color='Functional-LinkSecondary'>
                  <Icon as={RemovedWearer} />
                  <Text>
                    {size(ineligibleWearers)} recently removed wearers
                  </Text>
                </HStack>
                <Button
                  size='xs'
                  variant='ghost'
                  fontWeight='medium'
                  color='blue.500'
                  onClick={onToggleIneligibleWearers}
                >
                  {ineligibleWearersExpanded ? 'Hide' : 'Review'}
                </Button>
              </Flex>
              <Stack>
                {map(ineligibleWearers, (w: HatWearer) => (
                  <WearerRow
                    wearer={w}
                    key={w.id}
                    isIneligible
                    currentUserIsAdmin={currentUserIsAdmin}
                    setChangeStatusWearer={setChangeStatusWearer}
                    setWearerToTransferFrom={setWearerToTransferFrom}
                  />
                ))}
              </Stack>
            </Stack>
          </Collapse>
        )}

        <WearerButtons />
      </Stack>

      <FullWearersListModal
        setChangeStatusWearer={setChangeStatusWearer}
        setWearerToTransferFrom={setWearerToTransferFrom}
      />

      {!isMobile && (
        <>
          <Modal name='claimFor' title='Claim hat for wearer' size='2xl'>
            <HatClaimForm />
          </Modal>

          <Modal
            name='hatWearerStatus'
            title='Remove a Wearer by revoking their Hat token'
            size='3xl'
          >
            <HatWearerStatusForm
              wearer={changeStatusWearer}
              eligibility='Not Eligible'
            />
          </Modal>

          <Modal name='transferHat' title='Transfer Hat to New Address'>
            <HatTransferForm currentWearerAddress={wearerToTransferFrom} />
          </Modal>

          <Modal name='newWearer' title='Add a Wearer by minting a Hat token'>
            <HatWearerForm localForm={localForm} />
          </Modal>
        </>
      )}
    </>
  );
};

export default WearersList;
