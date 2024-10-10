import { Button, Flex, Heading, Stack } from '@chakra-ui/react';
import { MultiAddressInput } from 'forms';
import { isEmpty, pick } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { HatWearer } from 'types';

export const AddForm = ({
  localForm,
  setUpdateList,
  setAdding,
  handleAddWearers,
  isLoading,
}: AddFormProps) => {
  const { watch, setValue } = pick(localForm, ['watch', 'setValue']);
  const addressesToAdd = watch?.('addresses');
  const isDisabled = isEmpty(addressesToAdd);

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
            setValue?.('addresses', []);
            setAdding(false);
          }}
        >
          Cancel
        </Button>

        <Button
          variant='primary'
          size='sm'
          onClick={handleAddWearers}
          isDisabled={isDisabled}
          isLoading={isLoading}
        >
          Add
        </Button>
      </Flex>
    </Stack>
  );
};

interface AddFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  setUpdateList: Dispatch<SetStateAction<HatWearer[]>>;
  setAdding: Dispatch<SetStateAction<boolean>>;
  handleAddWearers: () => void;
  isLoading: boolean;
}
