import { Button, Flex, Heading, Stack } from '@chakra-ui/react';
import { MultiAddressInput } from 'forms';
import React, { Dispatch, SetStateAction } from 'react';
import { UseFormReturn, UseFormSetValue } from 'react-hook-form';
import { AllowlistProfile } from 'types';

export const AddForm = ({
  localForm,
  setUpdateList,
  setValue,
  setAdding,
  handleAddWearers,
}: {
  localForm: UseFormReturn<any>;
  setUpdateList: Dispatch<SetStateAction<AllowlistProfile[]>>;
  setValue: UseFormSetValue<any>;
  setAdding: Dispatch<SetStateAction<boolean>>;
  handleAddWearers: () => void;
}) => {
  return (
    <Stack w='full' px={{ base: 4, md: 10 }} spacing={6}>
      <Stack spacing={1}>
        <Heading size='md'>Add an address</Heading>

        <MultiAddressInput
          name='addresses'
          localForm={localForm}
          checkEligibility={false}
          btnSize='xs'
        />
      </Stack>

      <Flex justify='space-between' w='full'>
        <Button
          size='sm'
          variant='outlineMatch'
          colorScheme='blue.500'
          onClick={() => {
            setUpdateList([]);
            setValue('addresses', []);
            setAdding(false);
          }}
        >
          Cancel
        </Button>
        <Button variant='primary' size='sm' onClick={handleAddWearers}>
          Add
        </Button>
      </Flex>
    </Stack>
  );
};
