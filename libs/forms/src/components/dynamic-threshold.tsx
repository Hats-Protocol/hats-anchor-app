'use client';

// import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';
import { Button, cn } from 'ui';

import { NumberInput } from './number-input';

const DynamicThreshold = ({ localForm }: DynamicThresholdProps) => {
  const { watch, setValue } = localForm;
  const dynamicThreshold = watch('dynamicThreshold');

  const minThreshold = watch('minThreshold');
  const targetThreshold = watch('targetThreshold');

  // TODO handle can't set min threshold higher than max threshold

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-end gap-6'>
        <div className={cn(dynamicThreshold ? 'w-1/2' : 'w-3/4')}>
          <NumberInput
            name='minThreshold'
            label='Minimum required signatures'
            subLabel='Signatures needed to complete a transaction'
            numOptions={{ min: 1, max: targetThreshold }}
            localForm={localForm}
          />
        </div>

        {!dynamicThreshold ? (
          <Button variant='outline' className='min-w-1/3' onClick={() => setValue('dynamicThreshold', true)}>
            Use a dynamic threshold
          </Button>
        ) : (
          <div className='w-1/2'>
            <NumberInput
              name='targetThreshold'
              label='Maximum required signatures'
              subLabel='Up to this point all signers are required to sign'
              numOptions={{ min: minThreshold }}
              localForm={localForm}
            />
          </div>
        )}
      </div>

      {dynamicThreshold && (
        <div className='flex flex-col gap-4'>
          <div className='rounded-md border border-gray-200 p-4'>
            <div className='flex flex-col gap-4'>
              <h3 className='text-lg font-medium'>Dynamic multisig thresholds</h3>

              {minThreshold - 1 > 0 && (
                <div className='flex justify-between'>
                  <p>Too few signers to complete a transaction</p>

                  <p className='font-medium'>
                    {minThreshold - 1} Signer
                    {minThreshold - 1 === 1 ? '' : 's'}
                  </p>
                </div>
              )}

              <div className='flex justify-between'>
                <p>Everyone signs to complete a transaction</p>

                <p className='font-medium'>
                  {minThreshold} - {targetThreshold} Signers
                </p>
              </div>

              <div className='flex justify-between'>
                <p>
                  <span className='font-medium'>{targetThreshold}</span> signatures are required
                </p>

                <p className='font-medium'>{targetThreshold}+ Signers</p>
              </div>
            </div>
          </div>

          <div className='flex justify-end'>
            <Button variant='outline' size='sm' onClick={() => setValue('dynamicThreshold', false)}>
              Use a static threshold
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

interface DynamicThresholdProps {
  localForm: UseFormReturn;
}

export { DynamicThreshold, type DynamicThresholdProps };
