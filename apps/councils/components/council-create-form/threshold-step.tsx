'use client';

import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  InputGroup,
  InputLeftAddon,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Input, NumberInput, RadioBox } from 'forms';

import { useCouncilForm } from '../../contexts/council-form';

export function ThresholdStep({ onNext }: { onNext: () => void }) {
  const { form, isLoading } = useCouncilForm();

  const thresholdType = form.watch('thresholdType');
  const percentageRequired = form.watch('percentageRequired');
  const minConfirmations = form.watch('minConfirmations');
  const maxMembers = form.watch('maxMembers');

  const calculateConfirmations = (total: number) => {
    if (thresholdType === 'RELATIVE') {
      return Math.ceil((total * (percentageRequired || 0)) / 100);
    }
    return form.watch('confirmationsRequired');
  };

  return (
    <Stack
      spacing={6}
      height='100%'
      as='form'
      onSubmit={form.handleSubmit(onNext)}
    >
      <Stack spacing={6} flex={1}>
        <Stack spacing={2}>
          <Heading size='2xl'>Signer Threshold</Heading>
          <Text color='gray.500' fontSize='sm'>
            Powered by Safe
          </Text>
        </Stack>

        <Stack>
          <FormLabel fontWeight='bold'>
            What&apos;s the Signer Threshold logic
          </FormLabel>
          <RadioBox
            name='thresholdType'
            localForm={form}
            options={[
              { label: 'Fixed number of confirmations', value: 'ABSOLUTE' },
              {
                label: 'Fixed percentage of council members',
                value: 'RELATIVE',
              },
            ]}
            textSize='md'
          />
        </Stack>

        {thresholdType === 'ABSOLUTE' ? (
          <Stack spacing={6}>
            <NumberInput
              name='confirmationsRequired'
              label='Confirmations required'
              localForm={form}
              options={{
                min: 1,
                max: maxMembers,
                required: true,
              }}
            />

            <NumberInput
              name='maxMembers'
              label='Maximum council members'
              localForm={form}
              options={{
                min: 1,
                required: true,
              }}
            />
          </Stack>
        ) : (
          <Stack spacing={6}>
            <Stack>
              <FormLabel fontWeight='bold'>Required confirmations</FormLabel>
              <InputGroup>
                <InputLeftAddon>%</InputLeftAddon>
                <NumberInput
                  name='percentageRequired'
                  localForm={form}
                  options={{
                    min: 1,
                    max: 100,
                    required: true,
                  }}
                />
              </InputGroup>
            </Stack>

            <Stack direction='row' spacing={4} w='full'>
              <Stack w='full'>
                <FormLabel fontWeight='bold'>Minimum council members</FormLabel>
                <NumberInput
                  name='minConfirmations'
                  localForm={form}
                  helperText={`${calculateConfirmations(minConfirmations)} Confirmations required`}
                  options={{
                    min: 1,
                    max: maxMembers,
                    required: true,
                  }}
                />
              </Stack>

              <Stack w='full'>
                <FormLabel fontWeight='bold'>Maximum council members</FormLabel>
                <NumberInput
                  name='maxMembers'
                  localForm={form}
                  helperText={`${calculateConfirmations(maxMembers)} Confirmations required`}
                  options={{
                    min: minConfirmations,
                    required: true,
                  }}
                />
              </Stack>
            </Stack>
          </Stack>
        )}
      </Stack>

      <HStack justify='flex-end' py={6}>
        <Button
          type='submit'
          bg='blue.50'
          color='blue.500'
          _hover={{ bg: 'blue.100' }}
          size='md'
          rightIcon={<ChevronRightIcon />}
          isDisabled={!form.formState.isValid}
          px={4}
          py={2}
          borderRadius='md'
        >
          Set Council Admission
        </Button>
      </HStack>
    </Stack>
  );
}
