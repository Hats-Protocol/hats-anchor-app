'use client';

import { useCouncilForm } from 'contexts';
import { useRouter } from 'next/navigation';

import { DetailsStep } from './details-step';
import { OnboardingStep } from './onboarding-step';
import { ThresholdStep } from './threshold-step';
import { SelectionMembersStep } from './selection-step/members-step';

interface CouncilCreateFormProps {
  step: string;
  subStep?: string;
  draftId: string;
}

export function CouncilCreateForm({
  step,
  subStep,
  draftId,
}: CouncilCreateFormProps) {
  const router = useRouter();
  const { persistForm, form } = useCouncilForm();

  const handleNext = async () => {
    console.log('form', form.getValues());
    try {
      await persistForm();

      if (step === 'selection') {
        const subStepMap = {
          members: 'management',
          management: 'agreement',
          agreement: 'compliance',
          compliance: 'finalize',
        };

        const nextSubStep = subStepMap[subStep as keyof typeof subStepMap];
        if (nextSubStep === 'finalize') {
          router.push(`/councils/new/finalize?draftId=${draftId}`);
        } else {
          router.push(
            `/councils/new/selection?subStep=${nextSubStep}&draftId=${draftId}`,
          );
        }
        return;
      }

      const nextStepMap = {
        details: 'threshold',
        threshold: 'onboarding',
        onboarding: 'selection',
      };

      const nextStep = nextStepMap[step as keyof typeof nextStepMap];
      if (nextStep === 'selection') {
        router.push(
          `/councils/new/${nextStep}?subStep=members&draftId=${draftId}`,
        );
      } else if (nextStep) {
        router.push(`/councils/new/${nextStep}?draftId=${draftId}`);
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
    case 'selection':
      switch (subStep) {
        case 'members':
          return <SelectionMembersStep onNext={handleNext} />;
        default:
          return null;
      }
    default:
      return null;
  }
}
