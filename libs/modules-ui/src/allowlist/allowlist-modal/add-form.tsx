import { Form, MultiAddressInput } from 'forms';
import { isEmpty, pick } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { HatWearer } from 'types';
import { Button } from 'ui';

const AddForm = ({ localForm, setUpdateList, setAdding, handleAddWearers, isLoading }: AddFormProps) => {
  const { watch, setValue } = pick(localForm, ['watch', 'setValue']);
  const addressesToAdd = watch?.('addresses');
  const isDisabled = isEmpty(addressesToAdd);

  return (
    <Form {...localForm}>
      <div className='w-full space-y-6 px-4 md:px-10'>
        <div className='space-y-1'>
          <h3 className='text-md'>Add an address</h3>

          <MultiAddressInput name='addresses' localForm={localForm} checkEligibility={false} btnSize='xs' />
        </div>

        <div className='flex w-full justify-between'>
          <Button
            size='sm'
            variant='outline-blue'
            onClick={() => {
              setUpdateList([]);
              setValue?.('addresses', []);
              setAdding(false);
            }}
          >
            Cancel
          </Button>

          <Button size='sm' onClick={handleAddWearers} disabled={isDisabled || isLoading}>
            Add
          </Button>
        </div>
      </div>
    </Form>
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

export { AddForm };
