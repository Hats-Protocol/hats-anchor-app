import {
  Box,
  Button,
  Collapse,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { useOverlay, useSelectedHat } from 'contexts';
import {
  HatClaimForForm,
  HatTransferForm,
  HatWearerForm,
  HatWearerStatusForm,
} from 'forms';
import { useWearerDetails } from 'hats-hooks';
import {
  filterWearers,
  isTopHat,
  isWearingAdminHat,
  maxSupplyText,
  sortWearers,
} from 'hats-utils';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSearch } from 'react-icons/fa';
import { HatWearer } from 'types';
import { commify, extendWearers } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import WearerButtons from './WearerButtons';
import WearerRow from './WearerRow';
import FullWearersListModal from './WearersModal';

const Modal = dynamic(() => import('ui').then((mod) => mod.Modal));
const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

const WearersList = () => {
  const localOverlay = useOverlay();
  const { isMobile } = useMediaStyles();
  const { address } = useAccount();
  const {
    selectedHat,
    eligibleWearers,
    ineligibleWearers,
    wearersLoading,
    chainId,
  } = useSelectedHat();
  const {
    isOpen: ineligibleWearersExpanded,
    onToggle: onToggleIneligibleWearers,
  } = useDisclosure();

  const [changeStatusWearer, setChangeStatusWearer] = useState<
    Hex | undefined
  >();
  const [wearerToTransferFrom, setWearerToTransferFrom] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const localForm = useForm({
    mode: 'onBlur',
  });

  const maxSupply = _.toNumber(_.get(selectedHat, 'maxSupply', 0));
  const extendedWearers = extendWearers(_.get(selectedHat, 'wearers'), []);

  const filteredWearers = useMemo(() => {
    if (!eligibleWearers) return undefined;
    const localEligibleWearers = _.filter(eligibleWearers, (w: HatWearer) =>
      _.includes(_.map(eligibleWearers, 'id'), w.id),
    );
    const sortedWearers = sortWearers({
      wearers: localEligibleWearers,
      address,
    });
    return _.slice(
      filterWearers(searchTerm, sortedWearers),
      0,
      6,
    ) as HatWearer[];
  }, [searchTerm, eligibleWearers, address]);
  const loadingWearers = Array(4).fill({});

  const { data: wearerDetails } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const currentUserIsAdmin = isWearingAdminHat(
    _.map(wearerDetails, 'id'),
    selectedHat?.id,
    !!isTopHat(selectedHat),
  );

  return (
    <>
      <Stack>
        <Stack spacing={4} px={{ base: 4, md: 10 }}>
          <Flex justify='space-between' alignItems='center'>
            <HStack spacing={1}>
              <Heading
                size={{ base: 'sm', md: 'md' }}
                variant={{ base: 'medium', md: 'default' }}
              >
                {_.size(eligibleWearers)} Wearer
                {(_.size(eligibleWearers) > 1 ||
                  _.size(eligibleWearers) === 0) &&
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
                variant='filled'
                _focus={{
                  bg: 'white',
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size={{ base: 'sm', md: 'md' }}
              />
            </InputGroup>
          )}
          {/* Wearers list */}
          {_.map(
            !wearersLoading ? filteredWearers : loadingWearers,
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
          {!wearersLoading && _.isEmpty(filteredWearers) && (
            <Box>
              <Flex justify='center' h='70px' align='center'>
                <Text>No wearers currently</Text>
              </Flex>
              <Divider />
            </Box>
          )}
        </Stack>
        {!_.isEmpty(ineligibleWearers) && (
          <Collapse startingHeight={25} in={ineligibleWearersExpanded}>
            <Stack px={10}>
              <Flex justify='space-between'>
                <HStack spacing={1} color='Functional-LinkSecondary'>
                  <Icon as={RemovedWearer} />
                  <Text>
                    {_.size(ineligibleWearers)} recently removed wearers
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
                {_.map(ineligibleWearers, (w: HatWearer) => (
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
          <Modal
            name='claimFor'
            title='Claim hat for wearer'
            size='2xl'
            localOverlay={localOverlay}
          >
            <HatClaimForForm />
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
