import {
  Box,
  Divider,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import {
  HatClaimForForm,
  HatTransferForm,
  HatWearerForm,
  HatWearerStatusForm,
} from 'forms';
import { useWearersEligibilityCheck } from 'hats-hooks';
import { filterWearers, maxSupplyText } from 'hats-utils';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSearch } from 'react-icons/fa';
import { HatWearer } from 'types';
import { commify, extendWearers } from 'utils';
import { Hex } from 'viem';

import WearerButtons from './WearerButtons';
import WearerRow from './WearerRow';
import FullWearersListModal from './WearersModal';

const Modal = dynamic(() => import('ui').then((mod) => mod.Modal));

const WearersList = () => {
  const localOverlay = useOverlay();
  const { isMobile } = useMediaStyles();
  const { chainId, editMode } = useTreeForm();
  const { selectedHat } = useSelectedHat();

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

  const { data: wearersEligibility } = useWearersEligibilityCheck({
    selectedHat,
    chainId,
    editMode,
  });

  const {
    eligibleWearers: eligibleWearerIds,
    // ineligibleWearers: ineligibleWearerIds,
  } = useMemo(() => {
    return _.pick(wearersEligibility, ['eligibleWearers', 'ineligibleWearers']);
  }, [wearersEligibility]);

  const filteredWearers = useMemo(() => {
    if (!eligibleWearerIds) return undefined;
    const localEligibleWearers = _.filter(extendedWearers, (w: HatWearer) =>
      _.includes(eligibleWearerIds, w.id),
    );
    return _.slice(
      filterWearers(searchTerm, localEligibleWearers),
      0,
      6,
    ) as HatWearer[];
  }, [searchTerm, extendedWearers, eligibleWearerIds]);

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
          <Skeleton isLoaded={typeof w.id === 'string'} key={w.id}>
            <WearerRow
              wearer={w}
              setChangeStatusWearer={setChangeStatusWearer}
              setWearerToTransferFrom={setWearerToTransferFrom}
            />
          </Skeleton>
        ))}
        {_.isEmpty(filteredWearers) && (
          <Box>
            <Flex justify='center' h='70px' align='center'>
              <Text>No wearers currently</Text>
            </Flex>
            <Divider />
          </Box>
        )}
      </Stack>

      <WearerButtons />

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
