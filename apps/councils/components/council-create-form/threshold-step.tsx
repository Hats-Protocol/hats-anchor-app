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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  Stack,
  Text,
  Spinner,
} from '@chakra-ui/react';

import { useCouncilForm } from '../../contexts/council-form';

export function ThresholdStep({ onNext }: { onNext: () => void }) {
  const { formData, updateFormData, isLoading } = useCouncilForm();

  if (isLoading) {
    return (
      <Stack height='100%' justify='center' align='center'>
        <Spinner size='xl' color='blue.500' />
      </Stack>
    );
  }

  const calculateConfirmations = (total: number) => {
    if (formData.thresholdType === 'RELATIVE') {
      return Math.ceil((total * (formData.percentageRequired || 0)) / 100);
    }
    return formData.confirmationsRequired;
  };

  return (
    <Stack spacing={6} height='100%'>
      <Stack spacing={6} flex={1}>
        <Stack spacing={2}>
          <Heading size='2xl'>Signer Threshold</Heading>
          <Text color='gray.500' fontSize='sm'>
            Powered by Safe
          </Text>
        </Stack>

        <FormControl>
          <FormLabel fontWeight='bold'>
            What&apos;s the Signer Threshold logic
          </FormLabel>
          <Stack direction='row' spacing={4}>
            <Radio
              isChecked={formData.thresholdType === 'ABSOLUTE'}
              onChange={() => updateFormData({ thresholdType: 'ABSOLUTE' })}
            >
              Fixed number of confirmations
            </Radio>
            <Radio
              isChecked={formData.thresholdType === 'RELATIVE'}
              onChange={() => updateFormData({ thresholdType: 'RELATIVE' })}
            >
              Fixed percentage of council members
            </Radio>
          </Stack>
        </FormControl>

        {formData.thresholdType === 'ABSOLUTE' ? (
          <Stack spacing={6}>
            <FormControl>
              <FormLabel fontWeight='bold'>Confirmations required</FormLabel>
              <NumberInput
                min={1}
                max={formData.maxMembers}
                value={formData.confirmationsRequired}
                onChange={(value) =>
                  updateFormData({ confirmationsRequired: Number(value) })
                }
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel fontWeight='bold'>Maximum council members</FormLabel>
              <NumberInput
                value={formData.maxMembers}
                onChange={(value) =>
                  updateFormData({ maxMembers: Number(value) })
                }
                width='full'
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </Stack>
        ) : (
          <Stack>
            <FormControl>
              <FormLabel fontWeight='bold'>Required confirmations</FormLabel>
              <InputGroup>
                <InputLeftAddon>%</InputLeftAddon>
                <NumberInput
                  min={1}
                  max={100}
                  value={formData.percentageRequired}
                  onChange={(value) =>
                    updateFormData({ percentageRequired: Number(value) })
                  }
                  width='full'
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </InputGroup>
            </FormControl>
            <Stack direction='row' spacing={4}>
              <FormControl>
                <FormLabel fontWeight='bold'>Minimum council members</FormLabel>
                <NumberInput
                  min={1}
                  max={formData.maxMembers}
                  value={formData.minConfirmations}
                  onChange={(value) =>
                    updateFormData({ minConfirmations: Number(value) })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  {calculateConfirmations(formData.minConfirmations)}{' '}
                  Confirmations required
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight='bold'>Maximum council members</FormLabel>
                <NumberInput
                  min={formData.minConfirmations}
                  value={formData.maxMembers}
                  onChange={(value) =>
                    updateFormData({ maxMembers: Number(value) })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  {calculateConfirmations(formData.maxMembers)} Confirmations
                  required
                </FormHelperText>
              </FormControl>
            </Stack>
          </Stack>
        )}
      </Stack>

      <HStack justify='flex-end' py={6}>
        <Button
          bg='blue.50'
          color='blue.500'
          _hover={{ bg: 'blue.100' }}
          size='md'
          rightIcon={<ChevronRightIcon />}
          onClick={onNext}
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
