'use client';

import { Button } from '@chakra-ui/react';
import { pick } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';

import { Input } from '../components';

export const CouncilDetailsForm = ({
  mainForm,
  setStep,
}: {
  mainForm: UseFormReturn<any>;
  setStep: Dispatch<SetStateAction<number>>;
}) => {
  const localForm = useForm();
  const { handleSubmit } = pick(localForm, ['handleSubmit']);

  const submitCouncilDetails = (values: any) => {
    const { setValue } = pick(mainForm, ['setValue']);

    setValue('test', values.test);
    setStep(1);
  };

  return (
    <form
      onSubmit={handleSubmit(submitCouncilDetails)}
      className='flex h-full flex-col justify-between'
    >
      <Input
        name='test'
        label='Test 1'
        localForm={localForm}
        options={{ required: true }}
      />

      <div className='flex justify-end'>
        <Button type='submit'>Next</Button>
      </div>
    </form>
  );
};
