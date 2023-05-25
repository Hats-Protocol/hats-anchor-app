/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import {
  Stack,
  Button,
  Flex,
  Tooltip,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  Box,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { isAddress } from 'viem';
import { FaCheck, FaTrash, FaUserPlus } from 'react-icons/fa';
import { useEnsAddress } from 'wagmi';
import useHatMint from '../hooks/useHatMint';
import useDebounce from '../hooks/useDebounce';
import CONFIG from '../constants';

const HatWearerForm = ({ hatId, chainId, currentWearers, maxSupply }) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit } = localForm;

  const [wearers, setWearers] = useState([]);
  const [newAddress, setNewAddress] = useState('');

  const newWearer = useDebounce(newAddress, CONFIG.debounce);
  const isAddressAlreadyAdded =
    wearers.some((wearer) => wearer.address === newAddress) ||
    currentWearers.includes(newAddress);

  const { writeAsync, isLoading } = useHatMint({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId,
    newWearers: wearers.map((wearer) => wearer.address),
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  const { data: ensResolvedAddress, isSuccess: isEnsAddress } = useEnsAddress({
    name: newAddress,
    chainId: 1,
  });

  const isNewWearerAddress = isAddress(newWearer) || ensResolvedAddress;
  const wouldExceedMaxSupply =
    currentWearers.length + wearers.length + 1 > maxSupply;
  const canAddWearer =
    isNewWearerAddress && !isAddressAlreadyAdded && !wouldExceedMaxSupply;

  const handleAddWearer = () => {
    const address = isAddress(newWearer) ? newWearer : ensResolvedAddress;
    setWearers([...wearers, { address, ens: isEnsAddress && newWearer }]);
    setNewAddress('');
  };

  const handleRemoveWearer = (index) => {
    setWearers(wearers.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Text color='gray.500'>
          Mint this hat to multiple addresses at once!
        </Text>
        <Flex alignItems='center' borderRadius={8}>
          <InputGroup flexGrow={1}>
            <InputLeftElement>
              <FaUserPlus ml={2} />
            </InputLeftElement>
            <Input
              w='calc(100% - 1rem)'
              textOverflow='ellipsis'
              type='address'
              placeholder='0x1234, vitalik.eth'
              value={newAddress}
              onChange={(e) =>
                setNewAddress(e.target.value?.toLowerCase() ?? '')
              }
              rightElement={ensResolvedAddress && <FaCheck color='green' />}
            />
            {ensResolvedAddress && (
              <InputRightElement right='2rem'>
                <FaCheck color='green' />
              </InputRightElement>
            )}
          </InputGroup>
          <Tooltip
            label={
              !canAddWearer
                ? !isNewWearerAddress
                  ? 'Please input a valid address'
                  : isAddressAlreadyAdded
                  ? 'Address already added'
                  : wouldExceedMaxSupply
                  ? 'Max supply would be exceeded'
                  : ''
                : ''
            }
            shouldWrapChildren
          >
            <IconButton
              isDisabled={!canAddWearer}
              onClick={handleAddWearer}
              icon={<FaCheck />}
              aria-label='Add'
              height={9}
              w={16}
            />
          </Tooltip>
        </Flex>

        {wearers.map(({ address, ens }, index) => (
          <Box key={address}>
            <Flex align='center' w='full' justifyContent='space-between'>
              <Input value={ens || address} readOnly w='calc(100% - 5rem)' />
              <IconButton
                type='button'
                onClick={() => handleRemoveWearer(index)}
                icon={<FaTrash />}
                aria-label='Remove'
                height={9}
                w={16}
              />
            </Flex>
            {ens && (
              <Text fontSize='sm' color='gray.500' mt={1}>
                Resolved address: {address}
              </Text>
            )}
          </Box>
        ))}

        <Flex justify='flex-end'>
          <Button
            type='submit'
            isDisabled={!writeAsync || isLoading || wearers.length === 0}
          >
            Mint
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatWearerForm;
