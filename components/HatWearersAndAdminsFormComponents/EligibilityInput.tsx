import { Box, Button, FormControl, Text } from '@chakra-ui/react';
import { WriteContractResult } from '@wagmi/core';
import React from 'react';
import { FaCheck } from 'react-icons/fa';

import Input from '@/components/atoms/Input';

import ChakraNextLink from '../atoms/ChakraNextLink';

type EligibilityInputProps = {
  localForm: any;
  showEligibilityResolvedAddress: boolean;
  mutable: boolean | undefined;
  eligibilityResolvedAddress: string;
  isEligibilityDisabled: boolean;
  isLoading: boolean;
  writeAsyncEligibility: (() => Promise<WriteContractResult>) | undefined;
};

const EligibilityInput: React.FC<EligibilityInputProps> = ({
  localForm,
  showEligibilityResolvedAddress,
  mutable,
  eligibilityResolvedAddress,
  isEligibilityDisabled,
  isLoading,
  writeAsyncEligibility,
}) => (
  <FormControl>
    <Box>
      <Input
        name='eligibility'
        label='ELIGIBILITY'
        tip={
          <Text size='xs' color='gray.500'>
            See{' '}
            <ChakraNextLink
              href=' https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/eligibility-requirements-for-wearers'
              decoration
              isExternal
            >
              docs.hatsprotocol.xyz
            </ChakraNextLink>{' '}
            for details
          </Text>
        }
        placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
        rightElement={
          showEligibilityResolvedAddress && <FaCheck color='green' />
        }
        localForm={localForm}
        isDisabled={!mutable}
      />
      {showEligibilityResolvedAddress && (
        <Text fontSize='sm' color='gray.500' mt={1}>
          Resolved address: {eligibilityResolvedAddress}
        </Text>
      )}
    </Box>
    <Button
      colorScheme='blue'
      isLoading={isLoading}
      isDisabled={isEligibilityDisabled}
      onClick={() => writeAsyncEligibility?.()}
      mt={4}
    >
      Update Eligibility
    </Button>
  </FormControl>
);

export default EligibilityInput;
