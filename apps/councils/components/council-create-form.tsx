'use client';

import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  Select,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useCouncilForm } from '../contexts/council-form';

interface CouncilCreateFormProps {
  step: string;
  draftId: string;
}

const CHAIN_OPTIONS = [
  { value: 'optimism', label: 'Optimism', icon: '/chains/optimism.svg' },
  { value: 'base', label: 'Base', icon: '/chains/base.svg' },
  { value: 'arbitrum', label: 'Arbitrum', icon: '/chains/arbitrum.svg' },
];

export function CouncilCreateForm({ step, draftId }: CouncilCreateFormProps) {
  const router = useRouter();
  const { formData, updateFormData, currentStep, setCurrentStep } =
    useCouncilForm();

  const handleNext = () => {
    console.log('formData', formData);
    const nextStepMap = {
      details: 'threshold',
      threshold: 'onboarding',
      onboarding: 'selection',
      selection: 'finalize',
    };

    const nextStep = nextStepMap[currentStep as keyof typeof nextStepMap];
    if (nextStep) {
      setCurrentStep(nextStep);
      router.push(`/councils/new/${nextStep}?draftId=${draftId}`);
    }
  };

  if (step === 'details') {
    return (
      <Stack spacing={6} height='100%'>
        <Stack spacing={6} flex={1}>
          <Text fontSize='xl' fontWeight='semibold'>
            Create your first Council
          </Text>

          <FormControl isRequired>
            <FormLabel>Organization name</FormLabel>
            <Stack spacing={2}>
              <FormHelperText>
                The name of the organization you are creating councils for.
              </FormHelperText>
              <Input
                placeholder='DAO or Company Name'
                value={formData.organizationName}
                onChange={(e) =>
                  updateFormData({ organizationName: e.target.value })
                }
              />
            </Stack>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Council name</FormLabel>
            <Stack spacing={2}>
              <FormHelperText>
                The name of your first council. You can add further councils
                later.
              </FormHelperText>
              <Input
                placeholder='Council Name'
                value={formData.councilName}
                onChange={(e) =>
                  updateFormData({ councilName: e.target.value })
                }
              />
            </Stack>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Choose a chain</FormLabel>
            <Stack spacing={2}>
              <FormHelperText>
                The chain you deploy the Safe Multisig and Hats Council to.
              </FormHelperText>
              <Select
                placeholder='Select chain'
                value={formData.chain}
                onChange={(e) => updateFormData({ chain: e.target.value })}
                icon={<ChevronDownIcon />}
              >
                {CHAIN_OPTIONS.map((chain) => (
                  <option key={chain.value} value={chain.value}>
                    <HStack spacing={2}>
                      <Image
                        src={chain.icon}
                        alt={chain.label}
                        width={20}
                        height={20}
                      />
                      <Text>{chain.label}</Text>
                    </HStack>
                  </option>
                ))}
              </Select>
            </Stack>
          </FormControl>

          <FormControl>
            <FormLabel>
              Council description{' '}
              <Text
                as='span'
                color='gray.500'
                fontSize='sm'
                fontWeight='normal'
              >
                Optional
              </Text>
            </FormLabel>
            <Stack spacing={2}>
              <FormHelperText>
                Add a short description or some links you want all council
                members to see.
              </FormHelperText>
              <Textarea
                placeholder='Bylaws, policies or important links'
                value={formData.description}
                onChange={(e) =>
                  updateFormData({ description: e.target.value })
                }
              />
            </Stack>
          </FormControl>
        </Stack>

        <HStack justify='flex-end' py={6}>
          <Button
            bg='blue.50'
            color='blue.500'
            _hover={{ bg: 'blue.100' }}
            size='md'
            rightIcon={<ChevronRightIcon />}
            onClick={handleNext}
            isDisabled={
              !formData.organizationName ||
              !formData.councilName ||
              !formData.chain
            }
            px={4}
            py={2}
            borderRadius='md'
          >
            Set Signer Threshold
          </Button>
        </HStack>
      </Stack>
    );
  }

  if (step === 'threshold') {
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
                onChange={() =>
                  updateFormData({ thresholdLogic: 'percentage' })
                }
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
                  <FormLabel fontWeight='bold'>
                    Minimum council members
                  </FormLabel>
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
                  <FormLabel fontWeight='bold'>
                    Maximum council members
                  </FormLabel>
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
            onClick={handleNext}
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

  return null;
}
