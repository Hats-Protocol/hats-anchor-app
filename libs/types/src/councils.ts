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
};

export interface CouncilFormData {
  // step 1
  organizationName: string;
  councilName: string;
  chain: string;
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
    address: string;
    minimum: number;
  };
  creator: string;
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
    complianceAdmins: CouncilMember[];
    createComplianceAdminRole: boolean;
    memberRequirements: {
      signAgreement: boolean;
      holdTokens: boolean;
      passCompliance: boolean;
    };
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
    members: boolean;
    management: boolean;
    compliance: boolean;
    agreement: boolean;
    tokens: boolean;
  };
  payment: boolean;
}
