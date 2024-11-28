// apps/councils/components/council-create-form/onboarding-step.tsx
'use client';

import { ChevronRightIcon } from '@chakra-ui/icons';
import { Button, HStack, Spinner, Stack, Text } from '@chakra-ui/react';
import { FiFileText, FiShield } from 'react-icons/fi';
import {
  RadioCard,
  RequirementBox,
} from '../../../../libs/forms/src/components';
import { useCouncilForm } from '../../contexts/council-form';

export function OnboardingStep({ onNext }: { onNext: () => void }) {
  const { form, isLoading } = useCouncilForm();

  if (isLoading) {
    return (
      <Stack height='100%' justify='center' align='center'>
        <Spinner size='xl' color='blue.500' />
      </Stack>
    );
  }

  return (
    <Stack
      spacing={8}
      height='100%'
      as='form'
      onSubmit={form.handleSubmit(onNext)}
    >
      <Stack spacing={8} flex={1}>
        <Text fontSize='2xl' fontWeight='bold'>
          Council Membership
        </Text>

        <Stack spacing={6}>
          <Text fontSize='lg' fontWeight='semibold'>
            How is the Council selected?
          </Text>
          <RadioCard
            name='membershipType'
            localForm={form}
            options={[
              {
                label: 'Appoint Council Members',
                value: 'APPOINTED',
                description:
                  'Create an agreement council members have to sign and abide',
                icon: FiFileText,
              },
              {
                label: 'Elect Council Members',
                value: 'ELECTED',
                description:
                  'Specify an amount of coins council members need to hold',
                icon: FiFileText,
                disabled: true,
              },
            ]}
            textSize='md'
          />
        </Stack>

        <Stack spacing={6}>
          <Text fontSize='lg' fontWeight='semibold'>
            What is required to join the Council?
          </Text>
          <RequirementBox
            name='requirements'
            localForm={form}
            options={[
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
            ]}
          />
        </Stack>
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
          Select Members
        </Button>
      </HStack>
    </Stack>
  );
}
