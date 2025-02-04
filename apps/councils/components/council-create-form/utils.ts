import type { StepValidation } from 'types';

interface NextStep {
  step: string;
  subStep?: string;
}

export function findNextInvalidStep(
  stepValidation: StepValidation,
  currentStep: string,
  currentSubStep?: string,
  requirements?: { [key: string]: boolean },
): NextStep {
  const steps = ['details', 'threshold', 'onboarding', 'selection', 'payment'];
  const currentStepIndex = steps.indexOf(currentStep);

  // Define selection sub-steps order
  const getSelectionSubSteps = (reqs: { [key: string]: boolean } = {}) => [
    'management',
    ...(reqs.signAgreement ? ['agreement'] : []),
    ...(reqs.holdTokens ? ['tokens'] : []),
    ...(reqs.passCompliance ? ['compliance'] : []),
    'members',
  ];

  // If we're in a selection sub-step, check next sub-step first
  if (currentStep === 'selection' && currentSubStep) {
    const subSteps = getSelectionSubSteps(requirements);
    const currentSubStepIndex = subSteps.indexOf(currentSubStep);

    // Check remaining sub-steps
    for (let i = currentSubStepIndex + 1; i < subSteps.length; i++) {
      const subStep = subSteps[i];
      if (!stepValidation.selectionSubSteps[subStep as keyof typeof stepValidation.selectionSubSteps]) {
        return { step: 'selection', subStep };
      }
    }
  }

  // Check remaining main steps
  for (let i = currentStepIndex + 1; i < steps.length; i++) {
    const stepKey = steps[i] as keyof typeof stepValidation;

    if (stepKey === 'selection') {
      const subSteps = getSelectionSubSteps(requirements);
      for (const subStep of subSteps) {
        if (!stepValidation.selectionSubSteps[subStep as keyof typeof stepValidation.selectionSubSteps]) {
          return { step: 'selection', subStep };
        }
      }
    } else if (!stepValidation[stepKey]) {
      return { step: steps[i] };
    }
  }

  // If all remaining steps are valid, check from beginning
  for (let i = 0; i <= currentStepIndex; i++) {
    const stepKey = steps[i] as keyof typeof stepValidation;
    if (!stepValidation[stepKey]) {
      return { step: steps[i] };
    }
  }

  return { step: 'payment' }; // Default to payment if all steps are valid
}

export function getNextStepButtonText(nextStep: NextStep): string {
  switch (nextStep.step) {
    case 'threshold':
      return 'Configure Signer Threshold';
    case 'onboarding':
      return 'Set up Council Membership';
    case 'selection':
      switch (nextStep.subStep) {
        case 'management':
          return 'Select Council Managers';
        case 'agreement':
          return 'Configure Agreement';
        case 'compliance':
          return 'Select Compliance Managers';
        case 'tokens':
          return 'Set Token Requirement';
        case 'members':
          return 'Select Council Members';
        default:
          return 'Continue';
      }
    case 'payment':
      return 'Subscribe and Deploy';
    default:
      return 'Continue';
  }
}
