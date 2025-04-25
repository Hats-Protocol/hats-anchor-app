import type { EligibilityRequirements, StepValidation } from 'types';

interface NextStep {
  step: string;
  subStep?: string;
}

export function findNextInvalidStep(
  stepValidation: StepValidation,
  currentStep: string,
  currentSubStep?: string,
  eligibilityRequirements?: EligibilityRequirements,
): NextStep {
  const steps = ['details', 'threshold', 'selection', 'eligibility', 'deploy'];
  const currentStepIndex = steps.indexOf(currentStep);

  // Define eligibility sub-steps order
  const getEligibilitySubSteps = (reqs: EligibilityRequirements = {}) => [
    'management',
    ...(reqs.agreement?.required ? ['agreement'] : []),
    ...(reqs.erc20?.required ? ['tokens'] : []),
    ...(reqs.compliance?.required ? ['compliance'] : []),
    'members',
  ];

  // If we're in a eligibility sub-step, check next sub-step first
  if (currentStep === 'eligibility' && currentSubStep) {
    const subSteps = getEligibilitySubSteps(eligibilityRequirements);
    const currentSubStepIndex = subSteps.indexOf(currentSubStep);

    // Check remaining sub-steps
    for (let i = currentSubStepIndex + 1; i < subSteps.length; i++) {
      const subStep = subSteps[i];
      if (!stepValidation.eligibilitySubSteps[subStep as keyof typeof stepValidation.eligibilitySubSteps]) {
        return { step: 'eligibility', subStep };
      }
    }
  }

  // Check remaining main steps
  for (let i = currentStepIndex + 1; i < steps.length; i++) {
    const stepKey = steps[i] as keyof typeof stepValidation;

    if (stepKey === 'eligibility') {
      const subSteps = getEligibilitySubSteps(eligibilityRequirements);
      for (const subStep of subSteps) {
        if (!stepValidation.eligibilitySubSteps[subStep as keyof typeof stepValidation.eligibilitySubSteps]) {
          return { step: 'eligibility', subStep };
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

  return { step: 'deploy' }; // Default to payment if all steps are valid
}

export function getNextStepButtonText(nextStep: NextStep): string {
  switch (nextStep.step) {
    case 'threshold':
      return 'Configure Signer Threshold';
    case 'selection':
      return 'Select Council Requirements';
    case 'eligibility':
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
    case 'deploy':
      return 'Subscribe and Deploy';
    default:
      return 'Continue';
  }
}
