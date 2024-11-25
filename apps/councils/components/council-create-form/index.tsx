'use client';

import { useRouter } from 'next/navigation';

import { useCouncilForm } from '../../contexts/council-form';
import { DetailsStep } from './details-step';
import { OnboardingStep } from './onboarding-step';
import { ThresholdStep } from './threshold-step';

interface CouncilCreateFormProps {
  step: string;
  draftId: string;
}

export function CouncilCreateForm({ step, draftId }: CouncilCreateFormProps) {
  const router = useRouter();
  const { formData, persistForm } = useCouncilForm();

  const handleNext = async () => {
    try {
      await persistForm();

      const nextStepMap = {
        details: 'threshold',
        threshold: 'onboarding',
        onboarding: 'selection',
        selection: 'finalize',
      };

      const nextStep = nextStepMap[step as keyof typeof nextStepMap];
      if (nextStep) {
        router.push(
          `/councils/new/${nextStep}${draftId ? `?draftId=${draftId}` : ''}`,
        );
      }
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  };

  switch (step) {
    case 'details':
      return <DetailsStep onNext={handleNext} />;
    case 'threshold':
      return <ThresholdStep onNext={handleNext} />;
    case 'onboarding':
      return <OnboardingStep onNext={handleNext} />;
    default:
      return null;
  }
}
