'use client';

import { StepValidation, useCouncilForm } from 'contexts';
import { useRouter } from 'next/navigation';

import { DetailsStep } from './details-step';
import { OnboardingStep } from './onboarding-step';
import { SelectionAgreementStep } from './selection-step/agreement-step';
import { SelectionComplianceStep } from './selection-step/compliance-step';
import { SelectionManagementStep } from './selection-step/management-step';
import { SelectionMembersStep } from './selection-step/members-step';
import { SubscribeDeployStep } from './subscribe-deploy-step';
import { ThresholdStep } from './threshold-step';
import { findNextInvalidStep } from './utils';

interface CouncilCreateFormProps {
  step: string;
  subStep?: string;
  draftId: string;
}

export function CouncilCreateForm({ step, subStep, draftId }: CouncilCreateFormProps) {
  const router = useRouter();
  const { persistForm, form, stepValidation, setStepValidation } = useCouncilForm();

  const handleNext = async () => {
    try {
      await persistForm(step, subStep);
      setStepValidation(step as keyof StepValidation, true);

      const nextStep = findNextInvalidStep(stepValidation, step, subStep, form.watch('requirements'));

      if (nextStep.subStep) {
        router.push(`/councils/new/${nextStep.step}?subStep=${nextStep.subStep}&draftId=${draftId}`);
      } else {
        router.push(`/councils/new/${nextStep.step}?draftId=${draftId}`);
      }
    } catch (error) {
      console.error('Failed to save form data:', error);
      setStepValidation(step as keyof StepValidation, false);
    }
  };

  switch (step) {
    case 'details':
      return <DetailsStep onNext={handleNext} />;
    case 'threshold':
      return <ThresholdStep onNext={handleNext} />;
    case 'onboarding':
      return <OnboardingStep onNext={handleNext} />;
    case 'selection':
      switch (subStep) {
        case 'members':
          return <SelectionMembersStep onNext={handleNext} />;
        case 'management':
          return <SelectionManagementStep onNext={handleNext} />;
        case 'agreement':
          return <SelectionAgreementStep onNext={handleNext} />;
        case 'compliance':
          return <SelectionComplianceStep onNext={handleNext} />;
        default:
          return null;
      }
    case 'payment':
      return <SubscribeDeployStep draftId={draftId} />;
    default:
      return null;
  }
}
