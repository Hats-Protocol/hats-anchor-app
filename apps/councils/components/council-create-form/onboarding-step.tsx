// apps/councils/components/council-create-form/onboarding-step.tsx
'use client';

import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Checkbox,
  HStack,
  Icon,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useRadio,
  useRadioGroup,
  UseRadioProps,
  Spinner,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { FiFileText, FiShield } from 'react-icons/fi';

import { useCouncilForm } from '../../contexts/council-form';

// Custom Radio Card component
function RadioCard(props: UseRadioProps & { children: React.ReactNode }) {
  const { getInputProps, getRadioProps } = useRadio(props);
  const input = getInputProps();
  const checkbox = getRadioProps();

  const isChecked = props.value === 'APPOINTED' || checkbox.checked;

  return (
    <Box as='label' width='100%'>
      <input {...input} />
      <Box
        {...checkbox}
        cursor={props.isDisabled ? 'not-allowed' : 'pointer'}
        borderWidth='1px'
        borderRadius='lg'
        _checked={{
          bg: 'blue.50',
          borderColor: 'blue.500',
          color: 'blue.500',
        }}
        _hover={{
          borderColor: props.isDisabled ? 'gray.200' : 'blue.500',
        }}
        px={6}
        py={4}
      >
        <HStack justify='space-between' width='100%'>
          {props.children}
          {!props.isDisabled ? (
            <Checkbox
              isChecked={isChecked}
              colorScheme='blue'
              pointerEvents='none'
            />
          ) : (
            <Text
              fontSize='2xs'
              bg='red.50'
              color='red.500'
              px={2}
              py={0.5}
              borderRadius='full'
              fontWeight='medium'
              alignSelf='center'
            >
              coming soon
            </Text>
          )}
        </HStack>
      </Box>
    </Box>
  );
}

export function OnboardingStep({ onNext }: { onNext: () => void }) {
  const { formData, updateFormData, isLoading } = useCouncilForm();

  if (isLoading) {
    return (
      <Stack height='100%' justify='center' align='center'>
        <Spinner size='xl' color='blue.500' />
      </Stack>
    );
  }

  useEffect(() => {
    if (!formData.membershipType) {
      updateFormData({ membershipType: 'APPOINTED' });
    }
  }, [formData.membershipType, updateFormData]);

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'membershipType',
    defaultValue: 'APPOINTED',
    value: formData.membershipType || 'APPOINTED',
    onChange: (value) =>
      updateFormData({ membershipType: value as 'APPOINTED' | 'ELECTED' }),
  });

  const handleRequirementChange = (key: string, value: boolean) => {
    updateFormData({
      requirements: {
        ...formData.requirements,
        [key]: value,
      },
    });
  };

  return (
    <Stack spacing={8} height='100%'>
      <Stack spacing={8} flex={1}>
        <Text fontSize='2xl' fontWeight='bold'>
          Council Membership
        </Text>

        <Stack spacing={6}>
          <Text fontSize='lg' fontWeight='semibold'>
            How is the Council selected?
          </Text>
          <Stack {...getRootProps()} spacing={4}>
            <RadioCard
              {...getRadioProps({ value: 'APPOINTED' })}
              defaultChecked
            >
              <HStack spacing={4}>
                <Icon as={FiFileText} boxSize={5} color='blue.500' />
                <Stack spacing={0}>
                  <Text fontWeight='semibold'>Appoint Council Members</Text>
                  <Text fontSize='sm' color='gray.600'>
                    Create an agreement council members have to sign and abide
                  </Text>
                </Stack>
              </HStack>
            </RadioCard>
            <RadioCard
              {...getRadioProps({ value: 'ELECTED', isDisabled: true })}
            >
              <HStack spacing={4} opacity={0.5}>
                <Icon as={FiFileText} boxSize={5} />
                <Stack spacing={0}>
                  <Text fontWeight='semibold'>Elect Council Members</Text>
                  <Text fontSize='sm' color='gray.600'>
                    Specify an amount of coins council members need to hold
                  </Text>
                </Stack>
              </HStack>
            </RadioCard>
          </Stack>
        </Stack>

        <Stack spacing={6}>
          <Text fontSize='lg' fontWeight='semibold'>
            What is required to join the Council?
          </Text>
          <Stack spacing={4}>
            {[
              {
                key: 'signAgreement',
                icon: FiFileText,
                title: 'Sign Agreement',
                description:
                  'Create an agreement council members have to sign and abide',
              },
              {
                key: 'holdTokens',
                icon: FiFileText,
                title: 'Hold Tokens',
                description:
                  'Specify an amount of coins council members need to hold',
              },
              {
                key: 'passCompliance',
                icon: FiShield,
                title: 'Pass Compliance Check',
                description:
                  'Choose a trusted onchain provider that gathers KYC data securely',
              },
            ].map((item) => (
              <Box
                key={item.key}
                borderWidth='1px'
                borderRadius='lg'
                px={6}
                py={4}
                borderColor={
                  formData.requirements[
                    item.key as keyof typeof formData.requirements
                  ]
                    ? 'blue.500'
                    : 'gray.200'
                }
                bg={
                  formData.requirements[
                    item.key as keyof typeof formData.requirements
                  ]
                    ? 'blue.50'
                    : 'white'
                }
                _hover={{
                  borderColor: 'blue.500',
                }}
                cursor='pointer'
                onClick={(e) => {
                  if (
                    e.target === e.currentTarget ||
                    e.target instanceof HTMLDivElement
                  ) {
                    handleRequirementChange(
                      item.key,
                      !formData.requirements[
                        item.key as keyof typeof formData.requirements
                      ],
                    );
                  }
                }}
              >
                <HStack justify='space-between' width='100%'>
                  <HStack spacing={4}>
                    <Icon
                      as={item.icon}
                      boxSize={6}
                      color={
                        formData.requirements[
                          item.key as keyof typeof formData.requirements
                        ]
                          ? 'blue.500'
                          : 'gray.400'
                      }
                    />
                    <Stack spacing={0.5}>
                      <Text fontWeight='semibold' color='gray.900'>
                        {item.title}
                      </Text>
                      <Text fontSize='sm' color='gray.500'>
                        {item.description}
                      </Text>
                    </Stack>
                  </HStack>
                  <Checkbox
                    isChecked={
                      formData.requirements[
                        item.key as keyof typeof formData.requirements
                      ]
                    }
                    onChange={(e) => {
                      e.stopPropagation();
                      handleRequirementChange(item.key, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    colorScheme='blue'
                  />
                </HStack>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Stack>

      <HStack justify='flex-end' py={6}>
        <Button
          bg='blue.50'
          color='blue.500'
          _hover={{ bg: 'blue.100' }}
          size='md'
          rightIcon={<ChevronRightIcon />}
          onClick={onNext}
          px={6}
          py={2}
          borderRadius='md'
          fontSize='sm'
        >
          Select Members
        </Button>
      </HStack>
    </Stack>
  );
}
