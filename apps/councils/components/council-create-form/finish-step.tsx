'use client';

import { useCouncilForm } from 'contexts';
import { Form, Input, RadioBox } from 'forms';
import { useToast } from 'hooks';
import { flatten, toNumber } from 'lodash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from 'ui';
import { logger, viemPublicClient } from 'utils';
import { TransactionReceipt } from 'viem';

export const FinishStep = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { deployOnSuccess, form } = useCouncilForm();
  const formData = form.getValues();
  const localForm = useForm();
  const values = localForm.watch();
  const { toast } = useToast();

  const handleSuccess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const client = viemPublicClient(toNumber(formData.chain.value));
    const { 'tx-one': tx1, 'tx-two': tx2, 'tx-three': tx3 } = values;
    const txData1 = await client.waitForTransactionReceipt({
      hash: tx1,
    });

    let extraLogs: TransactionReceipt['logs'] = [];
    if (tx2 && tx3) {
      const txData2 = await client.waitForTransactionReceipt({
        hash: tx2,
      });

      const txData3 = await client.waitForTransactionReceipt({
        hash: tx3,
      });
      extraLogs = flatten([txData2.logs, txData3.logs]);
    }
    logger.debug('txData1', txData1, 'extraLogs', extraLogs);

    toast({ title: 'Populating council', description: "We'll redirect you when the council is ready" });

    deployOnSuccess(txData1, extraLogs);
    setIsLoading(false);
  };

  useEffect(() => {
    localForm.reset({
      multipleTx: 'false',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='space-y-8'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold'>Finish Council Deploy</h2>
        <p className='text-sm text-gray-500'>When deployed externally, you can submit the transaction hash here.</p>
      </div>

      <Form {...localForm}>
        <form onSubmit={handleSuccess}>
          <div className='space-y-4'>
            <Input
              label={localForm.watch('multipleTx') !== 'true' ? 'Transaction Hash' : 'Hats Protocol Transaction Hash'}
              name='tx-one'
              placeholder='0x1234567890abcdef'
              type='text'
              localForm={localForm}
            />

            <div className='space-y-2'>
              <h3>Do you have multiple transactions?</h3>
              <RadioBox
                options={[
                  { label: 'Yes', value: 'true' },
                  { label: 'No', value: 'false' },
                ]}
                name='multipleTx'
                localForm={localForm}
              />
            </div>

            {localForm.watch('multipleTx') === 'true' && (
              <>
                <Input
                  label='Modules Transaction Hash'
                  name='tx-two'
                  placeholder='0x1234567890abcdef'
                  type='text'
                  localForm={localForm}
                />
                <Input
                  label='Safe and HSG Transaction Hash'
                  name='tx-three'
                  placeholder='0x1234567890abcdef'
                  type='text'
                  localForm={localForm}
                />
              </>
            )}

            <div className='flex justify-end'>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
