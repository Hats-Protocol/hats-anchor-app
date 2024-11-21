'use client';

import { useRouter } from 'next/navigation';

import { useCouncilForm } from '../../contexts/council-form';
import { DetailsStep } from './details-step';
import { ThresholdStep } from './threshold-step';

interface CouncilCreateFormProps {
  step: string;
  draftId: string;
}

export function CouncilCreateForm({ step, draftId }: CouncilCreateFormProps) {
  const router = useRouter();
  const { formData, setCurrentStep } = useCouncilForm();

  const handleNext = () => {
    console.log('formData', formData);
    const nextStepMap = {
      details: 'threshold',
      threshold: 'onboarding',
      onboarding: 'selection',
      selection: 'finalize',
    };

    const nextStep = nextStepMap[step as keyof typeof nextStepMap];
    if (nextStep) {
      setCurrentStep(nextStep);
      router.push(
        `/councils/new/${nextStep}${draftId ? `?draftId=${draftId}` : ''}`,
      );
    }
  };

  switch (step) {
    case 'details':
      return <DetailsStep onNext={handleNext} />;
    case 'threshold':
      return <ThresholdStep onNext={handleNext} />;
    default:
      return null;
  }
}
