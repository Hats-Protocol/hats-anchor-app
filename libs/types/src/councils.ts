import { Hex } from 'viem';

export interface CouncilDraft {
  id: string;
  step: number;
  data: CouncilFormData;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface FormMember {
  address: string;
  email: string;
  name?: string;
}

export interface CouncilMember extends FormMember {
  id: string;
}

export interface CouncilPayer extends CouncilMember {
  telegram?: string;
}

export type StepProps = {
  onNext(): void;
};

export type OffchainCouncilData = {
  id: string;
  hsg: string;
  membersSelectionModule: string;
  membersCriteriaModule: string;
  creationForm: CouncilFormData;
  organization: {
    name: string;
  };
  members: CouncilMember[];
  admins: CouncilMember[];
  complianceAdmins: CouncilMember[];
  payer: CouncilPayer;
  tokenRequirement: {
    address: string;
    minimum: number;
  };
  deployed: boolean;
};

export interface CompletedOptionalSteps {
  threshold: boolean;
  members: boolean;
  management: boolean;
  agreement: boolean;
  compliance: boolean;
}

export interface CouncilFormData {
  id?: string;
  // step 1
  organizationName: string;
  councilName: string;
  chain: { value: string; label: string; icon: string };
  councilDescription?: string;
  // step 2
  thresholdType: 'ABSOLUTE' | 'RELATIVE';
  // confirmationsRequired: number; // used if thresholdType is ABSOLUTE
  target: number; // used if thresholdType is RELATIVE
  min: number; // used if thresholdType is RELATIVE
  maxMembers: number;
  // step 3
  membershipType: 'APPOINTED' | 'ELECTED';
  requirements: {
    signAgreement: boolean;
    holdTokens: boolean;
    passCompliance: boolean;
  };
  // step 4
  members: CouncilMember[];
  admins: CouncilMember[];
  complianceAdmins: CouncilMember[];
  createComplianceAdminRole: 'true' | 'false';
  agreement?: string;
  createAgreementAdminRole: 'true' | 'false';
  agreementAdmins: CouncilMember[];
  payer?: {
    id: string;
    address: string;
    email: string;
    name?: string;
    telegram?: string;
  };
  acceptedTerms?: boolean;
  tokenRequirement: {
    address: { value: string; label: string } | undefined;
    minimum: number;
  };
  creator: string;
  completedOptionalSteps: CompletedOptionalSteps;
}

export interface CouncilFormResponse {
  councilCreationForm: {
    id: string;
    creator: string | null;
    organizationName: string | null;
    councilName: string | null;
    chain: number | null;
    councilDescription: string | null;
    thresholdType: 'ABSOLUTE' | 'RELATIVE' | null;
    thresholdTarget: number | null;
    thresholdMin: number | null;
    maxCouncilMembers: number | null;
    membersSelectionType: 'ALLOWLIST' | 'ELECTION' | null;
    members: CouncilMember[];
    admins: CouncilMember[];
    memberRequirements: {
      signAgreement: boolean;
      holdTokens: boolean;
      passCompliance: boolean;
    };
    complianceAdmins: CouncilMember[];
    createComplianceAdminRole: boolean;
    agreement?: string;
    createAgreementAdminRole: boolean;
    agreementAdmins: CouncilMember[];
    payer: CouncilPayer | null;
    tokenAddress: string | null;
    tokenAmount: number | null;
  };
}

export interface UpdateCouncilFormResponse {
  updateCouncilCreationForm: CouncilFormResponse['councilCreationForm'];
}

export interface StepValidation {
  details: boolean;
  threshold: boolean;
  onboarding: boolean;
  selection: boolean;
  selectionSubSteps: {
    management: boolean;
    compliance: boolean;
    agreement: boolean;
    tokens: boolean;
    members: boolean;
  };
  payment: boolean;
}

export interface LabeledModules {
  selection: Hex;
  criteria: Hex;
}
