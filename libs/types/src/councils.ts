import { Ruleset } from '@hatsprotocol/modules-sdk';
import { Hex } from 'viem';

import { ExtendedHSGV2 } from './authorities';

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
  telegram?: string;
}

export interface CouncilMember extends FormMember {
  id: string;
}

export interface CouncilPayer extends CouncilMember {
  telegram?: string;
}

export type StepProps = {
  onNext(): void;
  draftId: string;
};

export type OffchainCouncilData = {
  id: string;
  hsg: string;
  membersSelectionModule: string | undefined;
  membersCriteriaModule: string | undefined;
  creationForm: CouncilFormData;
  // organization: {
  //   name: string;
  // };
  // members: CouncilMember[];
  // admins: CouncilMember[];
  // complianceAdmins: CouncilMember[];
  // payer: CouncilPayer;
  // TODO adjust, this is the form structure but not the db structure
  // tokenRequirement: {
  //   address: string;
  //   minimum: string;
  // };
  treeId: number;
  chain: number;
  deployed: boolean;
};

export type CouncilData = OffchainCouncilData &
  Partial<Omit<ExtendedHSGV2, 'id'>> & {
    eligibilityRequirements?: EligibilityRequirements;
    eligibilityRules?: Ruleset[] | null | undefined;
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
  // org/council details
  organizationName: string | { value: string; label: string };
  councilName: string;
  chain: { value: string; label: string; icon: string }; // TODO: change to number
  councilDescription?: string;
  // hsg config
  thresholdType: 'ABSOLUTE' | 'RELATIVE';
  target: number;
  min: number;
  maxMembers: number;
  // eligibility
  membershipType: 'APPOINTED' | 'ELECTED';
  eligibilityRequirements: EligibilityRequirements;
  // associations
  members: CouncilMember[];
  admins: CouncilMember[];
  complianceAdmins: CouncilMember[];
  agreementAdmins: CouncilMember[];
  // deploy
  payer?: CouncilMember;
  acceptedTerms?: boolean;
  creator: string; // Hex
  // form state
  completedOptionalSteps: CompletedOptionalSteps;
}

export interface CreationForm {
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
  payer: CouncilPayer | null;
  // relationships
  members: CouncilMember[];
  admins: CouncilMember[];
  agreementAdmins: CouncilMember[];
  complianceAdmins: CouncilMember[];
  // requirements
  eligibilityRequirements: string;
  // deprecated
  // memberRequirements: {
  //   signAgreement: boolean;
  //   holdTokens: boolean;
  //   passCompliance: boolean;
  // };

  createComplianceAdminRole: boolean;
  agreement?: string;
  createAgreementAdminRole: boolean;
  tokenAddress: string | null;
  tokenAmount: string | null;
}

export interface EligibilityRequirement {
  // whether the module is required/selected for this council
  required: boolean; // [default: false]
  // id of existing admins for this module
  existingId: `0x${string}` | null; // [default: null] expects address for existing module
  // whether to use org managers or existing admins for this module
  existingAdmins: string | null; // [default: null, except selection is 'org-managers'] otherwise Hex for existing Hat ID
  // refers to members list or other content for the module
  set: boolean; // [default: false, if not form/fields are not optional]
  // refers to admins list for the module
  adminsSet: boolean; // [default: false, unless there's no admin actions]

  // module specific fields, defaults to null
  content?: string | null; // refers to content for the agreement module
  address?: `0x${string}` | null; // refers to token address for the erc20 module
  amount?: string | null; // refers to token amount for the erc20 module
  // cooldownPeriod?: number | null; // refers to cooldown period for the staking module
}

export interface EligibilityRequirements {
  [key: string]: EligibilityRequirement;
}

export interface CouncilFormResponse {
  councilCreationForm: CreationForm;
}

export interface UpdateCouncilFormResponse {
  updateCouncilCreationForm: CreationForm;
}

export interface DeployStatus {
  [key: string]: boolean;
}

export interface StepValidation {
  details: boolean;
  threshold: boolean;
  selection: boolean;
  eligibility: boolean;
  eligibilitySubSteps: {
    management: boolean;
    compliance: boolean;
    agreement: boolean;
    tokens: boolean;
    members: boolean;
  };
  deploy: boolean;
}

export interface LabeledModules {
  selection: Hex;
  criteria: Hex;
}

export interface Organization {
  id: string;
  name: string;
  councils: (OffchainCouncilData & { eligibilityRequirements: string })[];
}

export type ModulesAddresses = {
  multiClaimsHatter?: string;
  councilMemberAllowlist?: string;
  complianceAllowlist?: string;
  agreementModule?: string;
  erc20Module?: string;
  eligibilityChain?: string;
};

export type CouncilHatIds = {
  topHat: bigint;
  admin: bigint;
  automations: bigint;
  orgRolesGroup: bigint;
  organizationManager: bigint;
  complianceManager: bigint;
  agreementManager: bigint;
  councilRolesGroup: bigint;
  councilMember: bigint;
  council: bigint;
};
