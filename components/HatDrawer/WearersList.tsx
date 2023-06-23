/* eslint-disable no-shadow */
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import {
  Flex,
  HStack,
  Text,
  Stack,
  Heading,
  Divider,
  Input,
  InputLeftElement,
  InputGroup,
  Image,
} from '@chakra-ui/react';
import { FaPlus, FaSearch, FaUser } from 'react-icons/fa';

import { formatAddress } from '@/lib/general';
import { isAdmin } from '@/lib/hats';
import CONFIG from '@/constants';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import useHatBurn from '@/hooks/useHatBurn';
import useWearerDetails from '@/hooks/useWearerDetails';
import HatWearerStatusForm from '@/forms/HatWearerStatusForm';
import Modal from '@/components/Modal';
import { checkENSNames } from '@/lib/contract';
import { IHatWearer } from '@/types';
import HatWearerForm from '@/forms/HatWearerForm';

const WearersList = ({
  chainId,
  hatId,
  wearers,
  maxSupply,
  prettyId,
  setModals,
  localOverlay,
}: WearersListProps) => {
  const { address } = useAccount();
  const [changeStatusWearer, setChangeStatusWearer] = useState('');
  const [ensNames, setEnsNames] = useState<{
    [key: string]: string;
  }>({}); // { '0x123...': 'myname.eth' }
  const [searchTerm, setSearchTerm] = useState('');

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const currentWearerHats = _.map(_.get(wearer, 'currentHats'), 'prettyId');

  const { writeAsync: renounceHat } = useHatBurn({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId,
  });

  const handleRenounceHat = async () => {
    await renounceHat?.();
  };

  const filterWearers = (wearers: IHatWearer[]) => {
    if (!searchTerm) return wearers;

    return _.filter(wearers, (wearer) => {
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
      const ensNames = await checkENSNames(wearers);
      setEnsNames(ensNames);
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
            prettyId={prettyId}
            address={address}
            ensNames={ensNames}
            handleRenounceHat={handleRenounceHat}
            currentWearerHats={currentWearerHats}
            setModals={setModals}
            setChangeStatusWearer={setChangeStatusWearer}
          />
        ))}

        <Flex justify='space-between' color='blue.500'>
          <HStack
            cursor='pointer'
            _hover={{
              textDecor: 'underline',
            }}
            onClick={() => setModals({ newWearer: true })}
          >
            <FaPlus />
            <Text variant='ghost'>Add a wearer</Text>
          </HStack>
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

      <Modal name='newWearer' title='Mint' localOverlay={localOverlay}>
        <HatWearerForm
          hatId={hatId}
          chainId={chainId}
          currentWearers={_.map(wearers, 'id')}
          maxSupply={maxSupply}
        />
      </Modal>

      <Modal name='hatWearers' title='Hat Wearers' localOverlay={localOverlay}>
        <Flex direction='column' gap={4}>
          {wearers.map((wearer: { id: string }) => (
            <WearerRow
              key={wearer.id}
              wearer={wearer}
              prettyId={prettyId}
              address={address}
              ensNames={ensNames}
              handleRenounceHat={handleRenounceHat}
              currentWearerHats={currentWearerHats}
              setModals={setModals}
              setChangeStatusWearer={setChangeStatusWearer}
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
    </>
  );
};

export default WearersList;

const WearerRow = ({
  wearer,
  prettyId,
  address,
  ensNames,
  handleRenounceHat,
  currentWearerHats,
  setModals,
  setChangeStatusWearer,
}: {
  wearer: { id: string };
  prettyId: string;
  address?: string;
  ensNames: {
    [key: string]: string;
  };
  handleRenounceHat: () => void;
  currentWearerHats: string[];
  setModals: any;
  setChangeStatusWearer: any;
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

        {wearer.id === address?.toLowerCase() && (
          <>
            <Divider orientation='vertical' h={5} />
            <Text color='red.500' onClick={handleRenounceHat} cursor='pointer'>
              Renounce Hat
            </Text>
          </>
        )}

        {wearer.id !== address?.toLowerCase() &&
          isAdmin(prettyId, currentWearerHats) && (
            <>
              <Divider orientation='vertical' h={5} />
              <Text
                color='red.500'
                onClick={() => {
                  setModals({
                    hatWearerStatus: true,
                  });
                  setChangeStatusWearer(wearer.id);
                }}
                cursor='pointer'
              >
                Revoke Hat
              </Text>
            </>
          )}
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
}
