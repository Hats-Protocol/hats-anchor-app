'use client';

import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';

import NumberInput from './NumberInput';

export const DynamicThreshold = ({ localForm }: DynamicThresholdProps) => {
  const { watch, setValue } = localForm;
  const dynamicThreshold = watch('dynamicThreshold');

  const minThreshold = watch('minThreshold');
  const targetThreshold = watch('targetThreshold');

  // TODO handle can't set min threshold higher than max threshold

  return (
    <Stack spacing={4}>
      <Flex gap={6} align='end'>
        <Box w={dynamicThreshold ? '50%' : '65%'}>
          <NumberInput
            name='minThreshold'
            label='Minimum required signatures'
            subLabel='Signatures needed to complete a transaction'
            numOptions={{ min: 1, max: targetThreshold }}
            localForm={localForm}
          />
        </Box>

        {!dynamicThreshold ? (
          <Button variant='outline' minW='30%' onClick={() => setValue('dynamicThreshold', true)}>
            Use a dynamic threshold
          </Button>
        ) : (
          <Box w='50%'>
            <NumberInput
              name='targetThreshold'
              label='Maximum required signatures'
              subLabel='Up to this point all signers are required to sign'
              numOptions={{ min: minThreshold }}
              localForm={localForm}
            />
          </Box>
        )}
      </Flex>

      {dynamicThreshold && (
        <Stack spacing={4}>
          <Box borderRadius='md' border='1px solid' borderColor='gray.200' p={4}>
            <Stack>
              <Heading size='md'>Dynamic multisig thresholds</Heading>

              {minThreshold - 1 > 0 && (
                <Flex justify='space-between'>
                  <Text>Too few signers to complete a transaction</Text>

                  <Text fontWeight='medium'>
                    {minThreshold - 1} Signer
                    {minThreshold - 1 === 1 ? '' : 's'}
                  </Text>
                </Flex>
              )}

              <Flex justify='space-between'>
                <Text>Everyone signs to complete a transaction</Text>

                <Text fontWeight='medium'>
                  {minThreshold} - {targetThreshold} Signers
                </Text>
              </Flex>

              <Flex justify='space-between'>
                <Text>
                  <Box as='span' fontWeight='medium'>
                    {targetThreshold}
                  </Box>{' '}
                  signatures are required
                </Text>

                <Text fontWeight='medium'>{targetThreshold}+ Signers</Text>
              </Flex>
            </Stack>
          </Box>

          <Flex justify='end'>
            <Button variant='outline' size='sm' onClick={() => setValue('dynamicThreshold', false)}>
              Use a static threshold
            </Button>
          </Flex>
        </Stack>
      )}
    </Stack>
  );
};

interface DynamicThresholdProps {
  localForm: UseFormReturn;
}
