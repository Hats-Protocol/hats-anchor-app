import { Box, Button, FormControl, Text } from '@chakra-ui/react';
import { WriteContractResult } from '@wagmi/core';
import React from 'react';
import { FaCheck } from 'react-icons/fa';

import Input from '@/components/atoms/Input';

import ChakraNextLink from '../atoms/ChakraNextLink';

type ToggleInputProps = {
  localForm: any;
  showToggleResolvedAddress: boolean;
  mutable: boolean | undefined;
  toggleResolvedAddress: string;
  isToggleDisabled: boolean;
  isLoading: boolean;
  writeAsyncToggle: (() => Promise<WriteContractResult>) | undefined;
};

const ToggleInput: React.FC<ToggleInputProps> = ({
  localForm,
  showToggleResolvedAddress,
  mutable,
  toggleResolvedAddress,
  isToggleDisabled,
  isLoading,
  writeAsyncToggle,
}) => (
  <FormControl>
    <Box>
      <Input
        name='toggle'
        label='TOGGLE'
        tip={
          <Text size='xs' color='gray.500'>
            See{' '}
            <ChakraNextLink
              href='https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/toggle-activating-and-deactivating-hats'
              decoration
              isExternal
            >
              docs.hatsprotocol.xyz
            </ChakraNextLink>{' '}
            for details
          </Text>
        }
        placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
        rightElement={showToggleResolvedAddress && <FaCheck color='green' />}
        localForm={localForm}
        isDisabled={!mutable}
      />
      {showToggleResolvedAddress && (
        <Text fontSize='sm' color='gray.500' mt={1}>
          Resolved address: {toggleResolvedAddress}
        </Text>
      )}
    </Box>
    <Button
      colorScheme='blue'
      isLoading={isLoading}
      isDisabled={isToggleDisabled}
      onClick={() => writeAsyncToggle?.()}
      mt={4}
    >
      Update Toggle
    </Button>
  </FormControl>
);

export default ToggleInput;
