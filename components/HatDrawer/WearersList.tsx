import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { readContract } from '@wagmi/core';
import _ from 'lodash';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaEllipsisH, FaPlus, FaSearch, FaUser } from 'react-icons/fa';
import { useAccount } from 'wagmi';

import Modal from '@/components/Modal';
import CONFIG from '@/constants';
import abi from '@/contracts/Hats.json';
import HatTransferForm from '@/forms/HatTransferForm';
import HatWearerForm from '@/forms/HatWearerForm';
import HatWearerStatusForm from '@/forms/HatWearerStatusForm';
import useHatBurn from '@/hooks/useHatBurn';
import useToast from '@/hooks/useToast';
import { checkENSNames } from '@/lib/contract';
import { formatAddress } from '@/lib/general';
import { IHatWearer } from '@/types';

const WearersList = ({
  chainId,
  hatId,
  wearers,
  maxSupply,
  prettyId,
  setModals,
  localOverlay,
  isAdminUser,
}: WearersListProps) => {
  const { address } = useAccount();
  const [changeStatusWearer, setChangeStatusWearer] = useState('');
  const [wearerToTransferFrom, setWearerToTransferFrom] = useState('');
  const [ensNames, setEnsNames] = useState<{
    [key: string]: string;
  }>({}); // { '0x123...': 'myname.eth' }
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const { writeAsync: renounceHat } = useHatBurn({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId,
  });

  const handleRenounceHat = async () => {
    await renounceHat?.();
  };

  const filterWearers = (localWearers: IHatWearer[]) => {
    if (!searchTerm) return wearers;

    return _.filter(localWearers, (wearer) => {
      const idSearch = wearer.id
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const ensSearch = ensNames[wearer.id]
        ? ensNames[wearer.id].toLowerCase().includes(searchTerm.toLowerCase())
        : false;

      return idSearch || ensSearch;
    });
  };

  useEffect(() => {
    const fetchENSNames = async () => {
      const localEnsNames = await checkENSNames(wearers);
      setEnsNames(localEnsNames);
    };

    fetchENSNames();
  }, [wearers, chainId]);

  useEffect(() => {
    if (address) {
      wearers?.sort((w1, w2) => {
        if (w1.id.toLowerCase() === address.toLowerCase()) return -1;
        if (w2.id.toLowerCase() === address.toLowerCase()) return 1;
        return 0;
      });
    }
  }, [address, wearers]);

  const filteredWearers = filterWearers(wearers);
  const maxWearersReached = wearers?.length >= maxSupply;

  const checkEligibility = async (wearer: string) => {
    const isEligible = await readContract({
      address: CONFIG.hatsAddress,
      abi,
      chainId,
      functionName: 'isEligible',
      args: [wearer, hatId],
    });

    if (isEligible) {
      toast.info({
        title: 'Eligible',
        description: `${wearer} is eligible to receive the hat.`,
      });
    } else {
      toast.error({
        title: 'Not Eligible',
        description: `${wearer} is not eligible to receive the hat.`,
      });
    }
  };

  return (
    <>
      {/* Main Details */}

      <Stack spacing={4}>
        <Flex justify='space-between'>
          <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
            Hat Wearer
          </Heading>
          <Flex gap={1}>
            <Text>{wearers?.length}</Text>
            <Text color='gray.400'>of {maxSupply}</Text>
          </Flex>
        </Flex>

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
        {/* Wearers list */}
        {_.slice(filteredWearers, 0, 6).map((wearer: { id: string }) => (
          <WearerRow
            key={wearer.id}
            wearer={wearer}
            isAdminUser={isAdminUser}
            address={address}
            ensNames={ensNames}
            handleRenounceHat={handleRenounceHat}
            setModals={setModals}
            setChangeStatusWearer={setChangeStatusWearer}
            setWearerToTransferFrom={setWearerToTransferFrom}
            checkEligibility={checkEligibility}
          />
        ))}

        <Flex justify='space-between' color='blue.500'>
          {isAdminUser && (
            <Tooltip
              label={
                maxWearersReached ? 'Maximum number of wearers reached.' : ''
              }
              fontSize='md'
              isDisabled={!maxWearersReached}
            >
              <Box>
                <HStack
                  cursor={maxWearersReached ? 'not-allowed' : 'pointer'}
                  _hover={{
                    textDecor: maxWearersReached ? 'none' : 'underline',
                  }}
                  onClick={() =>
                    !maxWearersReached ? setModals({ newWearer: true }) : {}
                  }
                  color={maxWearersReached ? 'gray.500' : 'blue.500'}
                >
                  <FaPlus />
                  <Text variant='ghost'>Add a wearer</Text>
                </HStack>
              </Box>
            </Tooltip>
          )}
          {wearers?.length > 6 && (
            <Text
              onClick={() => setModals({ hatWearers: true })}
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
          {wearers?.map((wearer: { id: string }) => (
            <WearerRow
              key={wearer.id}
              wearer={wearer}
              isAdminUser={isAdminUser}
              address={address}
              ensNames={ensNames}
              handleRenounceHat={handleRenounceHat}
              setModals={setModals}
              setChangeStatusWearer={setChangeStatusWearer}
              setWearerToTransferFrom={setWearerToTransferFrom}
              checkEligibility={checkEligibility}
            />
          ))}
        </Flex>
      </Modal>

      <Modal
        name='hatWearerStatus'
        title='Remove a Wearer by revoking their Hat token'
        localOverlay={localOverlay}
        size='3xl'
      >
        <HatWearerStatusForm
          prettyId={prettyId}
          chainId={chainId}
          wearer={changeStatusWearer}
          eligibility='Not Eligible'
        />
      </Modal>

      <Modal
        name='transferHat'
        title='Transfer Hat to New Address'
        localOverlay={localOverlay}
      >
        <HatTransferForm
          hatId={hatId}
          prettyId={prettyId}
          chainId={chainId}
          currentWearerAddress={wearerToTransferFrom}
        />
      </Modal>

      <Modal
        name='newWearer'
        title='Add a Wearer by minting a Hat token'
        localOverlay={localOverlay}
      >
        <HatWearerForm
          hatId={hatId}
          chainId={chainId}
          currentWearers={_.map(wearers, 'id')}
          maxSupply={maxSupply}
        />
      </Modal>
    </>
  );
};

export default WearersList;

const WearerRow = ({
  wearer,
  isAdminUser,
  address,
  ensNames,
  handleRenounceHat,
  setModals,
  setChangeStatusWearer,
  setWearerToTransferFrom,
  checkEligibility,
}: {
  wearer: { id: string };
  isAdminUser: boolean;
  address?: string;
  ensNames: {
    [key: string]: string;
  };
  handleRenounceHat: () => void;
  setModals: any;
  setChangeStatusWearer: any;
  setWearerToTransferFrom: (w: string) => void;
  checkEligibility: (w: string) => void;
}) => {
  return (
    <Flex key={wearer.id} justifyContent='space-between' alignItems='center'>
      <Flex
        alignItems='center'
        gap={2}
        backgroundColor={
          wearer.id.toLowerCase() === address?.toLowerCase()
            ? 'green.100'
            : 'transparent'
        }
      >
        {wearer.id.toLowerCase() === address?.toLowerCase() ? (
          <Image src='/icons/hat.svg' alt='Hat' />
        ) : (
          <FaUser />
        )}

        <Text>{ensNames[wearer.id] || formatAddress(_.get(wearer, 'id'))}</Text>
      </Flex>
      <Flex alignItems='center' gap={2}>
        <Link href={`/wearers/${wearer.id}`}>
          <Text color='blue.500'>View</Text>
        </Link>

        <Menu>
          <MenuButton
            as={IconButton}
            aria-label='Options'
            icon={<FaEllipsisH />}
            size='xs'
            variant='outline'
          />
          <MenuList>
            {isAdminUser && (
              <MenuItem
                onClick={() => {
                  setModals({
                    transferHat: true,
                  });
                  setWearerToTransferFrom(wearer.id);
                }}
              >
                Transfer
              </MenuItem>
            )}

            {wearer.id === address?.toLowerCase() && (
              <MenuItem onClick={handleRenounceHat}>Renounce</MenuItem>
            )}

            {wearer.id !== address?.toLowerCase() && isAdminUser && (
              <MenuItem
                onClick={() => {
                  setModals({
                    hatWearerStatus: true,
                  });
                  setChangeStatusWearer(wearer.id);
                }}
              >
                Revoke Hat
              </MenuItem>
            )}

            <MenuItem
              onClick={() => {
                checkEligibility(wearer.id);
              }}
            >
              Test Eligibility
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

interface WearersListProps {
  chainId: number;
  hatId: string;
  wearers: IHatWearer[];
  maxSupply: number;
  prettyId: string;
  setModals: any;
  localOverlay: any;
  isAdminUser: boolean;
}
