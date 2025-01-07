// apps/councils/components/council-create-form/onboarding-step.tsx
'use client';
import { Spinner, Stack, Text } from '@chakra-ui/react';
import { useCouncilForm } from 'contexts';
import { RadioCard, RequirementBox } from 'forms';
import { StepProps } from 'types';

import { AppointMembersIcon } from '../icons/appoint-members-icon';
import { ComplianceCheckIcon } from '../icons/compliance-check-icon';
import { ElectMembersIcon } from '../icons/elect-members-icon';
import { HoldTokensIcon } from '../icons/hold-tokens-icon';
import { SignAgreementIcon } from '../icons/sign-agreement-icon';
import { NextStepButton } from '../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from './utils';

export function OnboardingStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation } = useCouncilForm();
  const requirements = form.watch('requirements');

  const nextStep = findNextInvalidStep(stepValidation, 'onboarding', undefined, requirements);

  if (isLoading) {
    return (
      <Stack height='100%' justify='center' align='center'>
        <Spinner size='xl' color='blue.500' />
      </Stack>
    );
  }

  return (
    <Stack spacing={8} height='100%' as='form' onSubmit={form.handleSubmit(onNext)}>
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
                description: 'Create an agreement council members have to sign and abide',
                icon: AppointMembersIcon,
              },
              {
                label: 'Elect Council Members',
                value: 'ELECTED',
                description: 'Specify an amount of coins council members need to hold',
                icon: ElectMembersIcon,
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
                icon: SignAgreementIcon,
                title: 'Sign Agreement',
                description: 'Create an agreement council members have to sign and abide',
              },
              {
                key: 'holdTokens',
                icon: HoldTokensIcon,
                title: 'Hold Tokens',
                description: 'Specify an amount of coins council members need to hold',
              },
              {
                key: 'passCompliance',
                icon: ComplianceCheckIcon,
                title: 'Pass Compliance Check',
                description: 'Choose a trusted onchain provider that gathers KYC data securely',
              },
            ]}
          />
        </Stack>
      </Stack>

      <div className='flex justify-end py-6'>
        <NextStepButton disabled={!form.formState.isValid}>{getNextStepButtonText(nextStep)}</NextStepButton>
      </div>
    </Stack>
  );
}
