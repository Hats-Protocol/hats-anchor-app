export interface CouncilFormData {
  organizationName: string;
  councilName: string;
  chain: string;
  description?: string;
  members?: string[];
  admissionRequirements?: string[];
  confirmationThreshold?: number;
}

export interface CouncilDraft {
  id: string;
  step: number;
  data: CouncilFormData;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
