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
import { lazy, Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import Suspender from '@/components/atoms/Suspender';
import { IOverlayContext } from '@/contexts/OverlayContext';
import { isSameAddress } from '@/lib/general';
import { IHat, IHatWearer } from '@/types';

import WearerRow from './WearerRow';

const Modal = lazy(() => import('@/components/atoms/Modal'));
const HatTransferForm = lazy(() => import('@/forms/HatTransferForm'));
const HatWearerForm = lazy(() => import('@/forms/HatWearerForm'));
const HatWearerStatusForm = lazy(() => import('@/forms/HatWearerStatusForm'));

const WearersList = ({
  chainId,
  hatData,
  localOverlay,
  isAdminUser,
}: WearersListProps) => {
  const currentNetworkId = useChainId();
  const { address } = useAccount();
  const { setModals } = localOverlay;
  const [changeStatusWearer, setChangeStatusWearer] = useState<
    Hex | undefined
  >();
  const [wearerToTransferFrom, setWearerToTransferFrom] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const localForm = useForm({
    mode: 'onBlur',
  });

  const { extendedWearers: wearers, maxSupply, id: hatId } = hatData;

  const filterWearers = (localWearers: IHatWearer[] | undefined) => {
    if (!searchTerm || !localWearers) return wearers;

    return _.filter(localWearers, (wearer) => {
      const idSearch = wearer.id
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const ensSearch = wearer.ensName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return idSearch || ensSearch;
    });
  };

  useEffect(() => {
    if (address) {
      wearers?.sort((w1, w2) => {
        if (isSameAddress(w1.id, address)) return -1;
        if (isSameAddress(w2.id, address)) return 1;
        return 0;
      });
    }
  }, [address, wearers]);

  const filteredWearers = _.slice(filterWearers(wearers), 0, 6) as IHatWearer[];
  const maxWearersReached = _.gte(_.size(wearers), maxSupply);

  return (
    <>
      {/* Main Details */}

      <Stack spacing={4}>
        <Flex justify='space-between'>
          <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
            Hat Wearers
          </Heading>
          <Flex gap={1}>
            <Text>{wearers?.length}</Text>
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
        {filteredWearers.map((wearer: IHatWearer) => (
          <WearerRow
            key={wearer.id}
            wearer={wearer}
            isAdminUser={isAdminUser}
            address={address}
            setModals={setModals}
            setChangeStatusWearer={setChangeStatusWearer}
            setWearerToTransferFrom={setWearerToTransferFrom}
            isSameChain={chainId === currentNetworkId}
            hatId={hatId}
            chainId={chainId}
            currentNetworkId={currentNetworkId}
            wearers={wearers}
          />
        ))}

        <Flex justify='space-between' color='blue.500'>
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
          {_.gt(_.size(wearers), 6) && (
            <Text
              onClick={() => setModals?.({ hatWearers: true })}
              cursor='pointer'
              _hover={{
                textDecor: 'underline',
              }}
            >
              Show all {wearers?.length} wearers
            </Text>
          )}
        </Flex>
      </Stack>

      <Modal name='hatWearers' title='Hat Wearers' localOverlay={localOverlay}>
        <Flex direction='column' gap={4}>
          {wearers?.map((wearer: IHatWearer) => (
            <WearerRow
              key={wearer.id}
              wearer={wearer}
              isAdminUser={isAdminUser}
              address={address}
              setModals={setModals}
              setChangeStatusWearer={setChangeStatusWearer}
              setWearerToTransferFrom={setWearerToTransferFrom}
              isSameChain={chainId === currentNetworkId}
              hatId={hatId}
              chainId={chainId}
              currentNetworkId={currentNetworkId}
              wearers={wearers}
            />
          ))}
        </Flex>
      </Modal>

      <Suspense fallback={<Suspender />}>
        <Modal
          name='hatWearerStatus'
          title='Remove a Wearer by revoking their Hat token'
          localOverlay={localOverlay}
          size='3xl'
        >
          <HatWearerStatusForm
            hatId={hatId}
            chainId={chainId}
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
          <HatTransferForm
            hatId={hatId}
            chainId={chainId}
            currentWearerAddress={wearerToTransferFrom}
          />
        </Modal>
      </Suspense>

      <Suspense fallback={<Suspender />}>
        <Modal
          name='newWearer'
          title='Add a Wearer by minting a Hat token'
          localOverlay={localOverlay}
        >
          <HatWearerForm
            hatData={hatData}
            chainId={chainId}
            localForm={localForm}
          />
        </Modal>
      </Suspense>
    </>
  );
};

export default WearersList;
interface WearersListProps {
  chainId: number;
  hatData: IHat;
  localOverlay: IOverlayContext;
  isAdminUser: boolean;
}
