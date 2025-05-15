'use client';

import { useCouncilForm } from 'contexts';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import type { StepValidation } from 'types';
import { logger } from 'utils';

import { DeployStep } from './deploy-step';
import { DetailsStep } from './details-step';
import { AgreementStep, ComplianceStep, ManagementStep, MembersStep, TokensStep } from './eligibility-step';
import { ErrorPage } from './error-page';
import { FinishStep } from './finish-step';
import { SelectionStep } from './select-step';
import { ThresholdStep } from './threshold-step';
import { findNextInvalidStep } from './utils';

interface CouncilCreateFormProps {
  step: string;
  subStep?: string;
  draftId: string;
}

export function CouncilCreateForm({ step, subStep, draftId }: CouncilCreateFormProps) {
  const router = useRouter();
  const { persistForm, form, stepValidation, setStepValidation, error } = useCouncilForm();

  // Show database error if we failed to load the draft data
  if (error) {
    // Get the GraphQL error details from the query error
    const gqlError = (error as { response?: { errors?: { extensions?: { code?: string } }[] } })?.response?.errors?.[0];
    const errorCode = gqlError?.extensions?.code;

    switch (errorCode) {
      case 'BAD_REQUEST':
        return (
          <ErrorPage
            title='Invalid Council Draft ID'
            description='The URL contains an invalid council draft ID format. Please check the URL and try again.'
          />
        );
      case 'NOT_FOUND':
        return (
          <ErrorPage
            title='Council Draft Not Found'
            description='This council draft does not exist. Please check the URL and try again.'
          />
        );
      default:
        return (
          <ErrorPage
            title='Problem Loading Council Draft'
            description='We encountered an unexpected error while loading the council draft. Please try again later.'
          />
        );
    }
  }
  const handleNext = async () => {
    try {
      await persistForm(step, subStep);
      setStepValidation(step as keyof StepValidation, true);

      const nextStep = findNextInvalidStep(stepValidation, step, subStep, form.watch('eligibilityRequirements'));

      if (nextStep.subStep) {
        router.push(`/councils/new/${nextStep.step}?subStep=${nextStep.subStep}&draftId=${draftId}`);
      } else {
        router.push(`/councils/new/${nextStep.step}?draftId=${draftId}`);
      }
      posthog.capture('Advanced Council Form', {
        step,
        subStep,
      });
    } catch (error) {
      logger.error('Failed to save form data:', error);
      setStepValidation(step as keyof StepValidation, false);
    }
  };

  switch (step) {
    case 'details':
      return <DetailsStep onNext={handleNext} draftId={draftId} />;
    case 'threshold':
      return <ThresholdStep onNext={handleNext} draftId={draftId} />;
    case 'selection':
      return <SelectionStep onNext={handleNext} draftId={draftId} />;
    case 'eligibility':
      switch (subStep) {
        case 'management':
          return <ManagementStep onNext={handleNext} draftId={draftId} />;
        case 'agreement':
          return <AgreementStep onNext={handleNext} draftId={draftId} />;
        case 'compliance':
          return <ComplianceStep onNext={handleNext} draftId={draftId} />;
        case 'tokens':
          return <TokensStep onNext={handleNext} draftId={draftId} />;
        case 'members':
          return <MembersStep onNext={handleNext} draftId={draftId} />;
        default:
          // router.replace(`/councils/new/eligibility?subStep=management&draftId=${draftId}`);
          return null;
      }
    case 'deploy':
      return <DeployStep draftId={draftId} />;
    case 'finish':
      return <FinishStep />;
    default:
      return null;
  }
}
