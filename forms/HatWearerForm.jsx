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
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { isAddress } from 'viem';
import { FaCheck, FaUserPlus } from 'react-icons/fa';
import useHatMint from '../hooks/useHatMint';
import useDebounce from '../hooks/useDebounce';
import CONFIG from '../constants';

const HatWearerForm = ({ hatId, chainId, currentWearers, maxSupply }) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit } = localForm;

  const [wearers, setWearers] = useState([]);
  const [newAddress, setNewAddress] = useState('');

  const newWearer = useDebounce(newAddress, CONFIG.debounce);
  const isNewWearerAddress = isAddress(newWearer);
  const isAddressAlreadyAdded =
    wearers.some((wearer) => wearer.address === newAddress) ||
    currentWearers.includes(newAddress);

  const wouldExceedMaxSupply =
    currentWearers.length + wearers.length + 1 > maxSupply;
  const canAddWearer =
    isNewWearerAddress && !isAddressAlreadyAdded && !wouldExceedMaxSupply;

  const { writeAsync, isLoading } = useHatMint({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId,
    newWearers: wearers.map((wearer) => wearer.address),
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  const handleAddWearer = () => {
    if (isNewWearerAddress && !isAddressAlreadyAdded) {
      setWearers([...wearers, { address: newAddress }]);
      setNewAddress('');
    }
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
              pl={16}
              pr={3}
              w='calc(100% - 7rem)'
              textOverflow='ellipsis'
              type='address'
              placeholder='Paste or write an ETH address...'
              value={newAddress}
              onChange={(e) =>
                setNewAddress(e.target.value?.toLowerCase() ?? '')
              }
            />
            <InputRightElement w='4rem'>
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
            </InputRightElement>
          </InputGroup>
        </Flex>

        {wearers.map((wearer, index) => (
          <Flex
            key={wearer}
            align='center'
            w='full'
            justifyContent='space-between'
          >
            <Input value={wearer.address} readOnly w='calc(100% - 7rem)' />
            <Button type='button' onClick={() => handleRemoveWearer(index)}>
              Remove
            </Button>
          </Flex>
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
