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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  Stack,
  Text,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';

import { useCouncilForm } from '../../contexts/council-form';

export function ThresholdStep({ onNext }: { onNext: () => void }) {
  const { formData, updateFormData } = useCouncilForm();

  const calculateConfirmations = (total: number) => {
    if (formData.thresholdLogic === 'percentage') {
      return Math.ceil((total * (formData.requiredPercentage || 0)) / 100);
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
            What's the Signer Threshold logic
          </FormLabel>
          <Stack direction='row' spacing={4}>
            <Radio
              isChecked={formData.thresholdLogic === 'fixed'}
              onChange={() => updateFormData({ thresholdLogic: 'fixed' })}
            >
              Fixed number of confirmations
            </Radio>
            <Radio
              isChecked={formData.thresholdLogic === 'percentage'}
              onChange={() => updateFormData({ thresholdLogic: 'percentage' })}
            >
              Fixed percentage of council members
            </Radio>
          </Stack>
        </FormControl>

        {formData.thresholdLogic === 'fixed' ? (
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
                  value={formData.requiredPercentage}
                  onChange={(value) =>
                    updateFormData({ requiredPercentage: Number(value) })
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
                  value={formData.minMembers}
                  onChange={(value) =>
                    updateFormData({ minMembers: Number(value) })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  {calculateConfirmations(formData.minMembers)} Confirmations
                  required
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight='bold'>Maximum council members</FormLabel>
                <NumberInput
                  min={formData.minMembers}
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
