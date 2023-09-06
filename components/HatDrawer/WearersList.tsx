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
import useWearerDetails from '@/hooks/useWearerDetails';
import useWearersEligibilityCheck from '@/hooks/useWearersEligibilityCheck';
import { isSameAddress } from '@/lib/general';
import { isTopHat, isWearer, prettyIdToId } from '@/lib/hats';
import { filterWearers, getEligibleWearers } from '@/lib/wearers';
import { IHatWearer } from '@/types';

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
  const { chainId, selectedHat, treeId } = useTreeForm();
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
  const { data: wearersEligibility } = useWearersEligibilityCheck({
    wearerIds,
  });

  const eligibleWearers = getEligibleWearers({
    wearersEligibility,
    wearers,
    selectedHat,
  });

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });

  const currentWearerHats = _.map(wearer, 'id');
  const isAdminUser = isWearer(currentWearerHats, selectedHat?.id);
  const isAdminOfTopHat = isWearer(currentWearerHats, prettyIdToId(treeId));

  const sortWearers = useCallback(() => {
    if (address) {
      eligibleWearers?.sort((w1, w2) => {
        if (isSameAddress(w1.id, address)) return -1;
        if (isSameAddress(w2.id, address)) return 1;
        return 0;
      });
    }
  }, [address, eligibleWearers]);

  useEffect(() => {
    sortWearers();
  }, [sortWearers]);

  const filteredWearers = _.slice(
    filterWearers(searchTerm, eligibleWearers),
    0,
    6,
  ) as IHatWearer[];
  const maxWearersReached = _.gte(_.size(wearers), maxSupply);

  return (
    <>
      <Stack spacing={4}>
        <Flex justify='space-between'>
          <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
            Hat Wearers
          </Heading>
          <Flex gap={1}>
            <Text>{eligibleWearers?.length}</Text>
            <Text color='gray.400'>of {maxSupply}</Text>
          </Flex>
        </Flex>

        {_.gt(_.size(eligibleWearers), 5) && (
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
        {filteredWearers.map((w: IHatWearer) => (
          <WearerRow
            key={w.id}
            wearer={w}
            isAdminUser={isAdminUser}
            setChangeStatusWearer={setChangeStatusWearer}
            setWearerToTransferFrom={setWearerToTransferFrom}
            isTopHat={isTopHat(selectedHat)}
          />
        ))}

        <Flex justify='space-between' color='blue.500'>
          {isAdminOfTopHat && (
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
          {_.gt(_.size(eligibleWearers), 6) && (
            <Text
              onClick={() => setModals?.({ hatWearers: true })}
              cursor='pointer'
              _hover={{
                textDecor: 'underline',
              }}
            >
              Show all {eligibleWearers?.length} wearers
            </Text>
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
            {eligibleWearers?.map((w: IHatWearer) => (
              <WearerRow
                key={w.id}
                wearer={w}
                isAdminUser={isAdminUser}
                setChangeStatusWearer={setChangeStatusWearer}
                setWearerToTransferFrom={setWearerToTransferFrom}
                isTopHat={isTopHat(selectedHat)}
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
