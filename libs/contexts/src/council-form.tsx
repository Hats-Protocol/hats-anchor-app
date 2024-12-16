'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import {
  chainIdToString,
  chainStringToId,
  councilsGraphqlClient,
  GET_COUNCIL_FORM,
  UPDATE_COUNCIL_FORM,
} from 'utils';

interface CouncilMember {
  id: string;
  address: string;
  email: string;
  name?: string;
}

export interface CouncilFormData {
  // step 1
  organizationName: string;
  councilName: string;
  chain: string;
  councilDescription?: string;
  // step 2
  thresholdType: 'ABSOLUTE' | 'RELATIVE';
  confirmationsRequired: number; // used if thresholdType is ABSOLUTE
  percentageRequired: number; // used if thresholdType is RELATIVE
  minConfirmations: number; // used if thresholdType is RELATIVE
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
}

interface CouncilFormResponse {
  councilCreationForm: {
    organizationName: string | null;
    councilName: string | null;
    chain: number | null;
    councilDescription: string | null;
    thresholdType: 'ABSOLUTE' | 'RELATIVE' | null;
    thresholdTarget: number | null;
    thresholdMin: number | null;
    maxCouncilMembers: number | null;
    membersSelectionType: 'ALLOWLIST' | 'ELECTION' | null;
    members: Array<{
      id: string;
      address: string;
      email: string;
      name?: string;
    }>;
    admins: Array<{
      id: string;
      address: string;
      email: string;
      name?: string;
    }>;
    complianceAdmins: Array<{
      id: string;
      address: string;
      email: string;
      name?: string;
    }>;
    createComplianceAdminRole: boolean;
    memberRequirements: {
      signAgreement: boolean;
      holdTokens: boolean;
      passCompliance: boolean;
    };
    agreement?: string;
  };
}

interface UpdateCouncilFormResponse {
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

interface CouncilFormContextType {
  form: UseFormReturn<CouncilFormData>;
  isLoading: boolean;
  persistForm: (step: string, subStep?: string) => Promise<unknown>;
  stepValidation: StepValidation;
  setStepValidation: (step: keyof StepValidation, isValid: boolean) => void;
}

const CouncilFormContext = createContext<CouncilFormContextType | undefined>(
  undefined,
);

const computeStepValidation = (
  data: CouncilFormResponse['councilCreationForm'],
): StepValidation => {
  return {
    details: !!(
      data.organizationName &&
      data.organizationName !== '' &&
      data.councilName &&
      data.councilName !== '' &&
      data.chain !== null
    ),
    threshold: !!(
      data.maxCouncilMembers &&
      data.maxCouncilMembers > 0 &&
      data.thresholdType &&
      data.thresholdTarget &&
      data.thresholdTarget > 0
    ),
    onboarding: !!data.membersSelectionType,
    selection: false, // Main step validity will be computed from sub-steps
    selectionSubSteps: {
      members: !!data.members,
      management: !!(data.admins && data.admins.length > 0),
      compliance: data.createComplianceAdminRole !== null,
      agreement: true, // Default valid
      tokens: true, // Default valid
    },
    payment: false,
  };
};

// Add these types
interface DetailsStepData {
  organizationName: string;
  councilName: string;
  chain: number;
  councilDescription?: string;
}

interface ThresholdStepData {
  thresholdType: 'ABSOLUTE' | 'RELATIVE';
  maxCouncilMembers: number;
  thresholdTarget: number;
  thresholdMin: number;
}

interface OnboardingStepData {
  membersSelectionType: 'ALLOWLIST' | 'ELECTION';
  memberRequirements: {
    signAgreement: boolean;
    holdTokens: boolean;
    passCompliance: boolean;
  };
}

interface SelectionStepData {
  members: CouncilMember[];
  admins: CouncilMember[];
  complianceAdmins: CouncilMember[];
  createComplianceAdminRole: boolean;
}

export function CouncilFormProvider({
  children,
  draftId,
}: {
  children: React.ReactNode;
  draftId: string | null;
}) {
  const form = useForm<CouncilFormData>({
    defaultValues: {
      organizationName: '',
      councilName: '',
      chain: '',
      councilDescription: '',
      thresholdType: 'ABSOLUTE',
      confirmationsRequired: 4,
      percentageRequired: 51,
      minConfirmations: 2,
      maxMembers: 7,
      membershipType: 'APPOINTED',
      requirements: {
        signAgreement: false,
        holdTokens: false,
        passCompliance: false,
      },
      members: [],
      admins: [],
      complianceAdmins: [],
      createComplianceAdminRole: 'false',
    },
  });

  const [stepValidation, setStepValidationState] = useState<StepValidation>({
    details: false,
    threshold: false,
    onboarding: false,
    selection: false,
    selectionSubSteps: {
      members: false,
      management: false,
      compliance: false,
      agreement: true,
      tokens: true,
    },
    payment: false,
  });

  const setStepValidation = useCallback(
    (step: keyof StepValidation, isValid: boolean) => {
      setStepValidationState((prev) => ({
        ...prev,
        [step]: isValid,
      }));
    },
    [],
  );

  const { isLoading, data } = useQuery({
    queryKey: ['councilForm', draftId],
    queryFn: async () => {
      const result = await councilsGraphqlClient.request<CouncilFormResponse>(
        GET_COUNCIL_FORM,
        { id: draftId },
      );
      return result.councilCreationForm;
    },
    enabled: !!draftId,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (data) {
      console.log('API Response data:', data);
      const currentValues = form.getValues();
      console.log('Current form values:', currentValues);

      const newValues: CouncilFormData = {
        organizationName: data.organizationName || '',
        councilName: data.councilName || '',
        chain: chainIdToString(data.chain) || '',
        councilDescription: data.councilDescription || '',
        thresholdType: data.thresholdType || 'ABSOLUTE',
        confirmationsRequired: data.thresholdTarget || 4,
        percentageRequired: data.thresholdTarget || 51,
        minConfirmations: data.thresholdMin || 2,
        maxMembers: data.maxCouncilMembers || 7,
        membershipType:
          data.membersSelectionType === 'ELECTION' ? 'ELECTED' : 'APPOINTED',
        requirements: data.memberRequirements || {
          signAgreement: false,
          holdTokens: false,
          passCompliance: false,
        },
        members: data.members || [],
        admins: data.admins || [],
        complianceAdmins: data.complianceAdmins || [],
        createComplianceAdminRole: data.createComplianceAdminRole
          ? 'true'
          : 'false',
      };
      console.log('Setting form to:', newValues);
      form.reset(newValues);

      // Compute validation state here
      const validation = computeStepValidation(data);
      setStepValidationState(validation);
    }
  }, [data, form]);

  const queryClient = useQueryClient();

  const { mutateAsync: persistForm } = useMutation<
    UpdateCouncilFormResponse,
    Error,
    { step: string; subStep?: string }
  >({
    mutationFn: async ({ step, subStep }) => {
      const formData = form.getValues();
      let payload: any = { id: draftId };

      switch (step) {
        case 'details':
          payload = {
            ...payload,
            organizationName: formData.organizationName,
            councilName: formData.councilName,
            chain: chainStringToId(formData.chain),
            councilDescription: formData.councilDescription,
          };
          break;

        case 'threshold':
          payload = {
            ...payload,
            thresholdType: formData.thresholdType,
            maxCouncilMembers: parseInt(formData.maxMembers.toString()),
            thresholdTarget:
              formData.thresholdType === 'ABSOLUTE'
                ? parseInt(formData.confirmationsRequired.toString())
                : parseInt(formData.percentageRequired.toString()),
            thresholdMin:
              formData.thresholdType === 'ABSOLUTE'
                ? parseInt(formData.confirmationsRequired.toString())
                : parseInt(formData.minConfirmations.toString()),
          };
          break;

        case 'onboarding':
          payload = {
            ...payload,
            membersSelectionType:
              formData.membershipType === 'ELECTED' ? 'ELECTION' : 'ALLOWLIST',
            memberRequirements: formData.requirements,
          };
          break;

        case 'selection':
          switch (subStep) {
            case 'members':
              payload = {
                ...payload,
                members: formData.members,
              };
              break;
            case 'management':
              payload = {
                ...payload,
                admins: formData.admins,
              };
              break;
            case 'compliance':
              payload = {
                ...payload,
                complianceAdmins: formData.complianceAdmins,
                createComplianceAdminRole:
                  formData.createComplianceAdminRole === 'true',
              };
              break;
            // agreement and tokens cases will be added when implemented
          }
          break;
      }

      return await councilsGraphqlClient.request<UpdateCouncilFormResponse>(
        UPDATE_COUNCIL_FORM,
        payload,
      );
    },
    onSuccess: (data: UpdateCouncilFormResponse) => {
      queryClient.setQueryData(
        ['councilForm', draftId],
        data.updateCouncilCreationForm,
      );
    },
  });

  return (
    <CouncilFormContext.Provider
      value={{
        form,
        isLoading,
        persistForm: (step: string, subStep?: string) =>
          persistForm({ step, subStep }),
        stepValidation,
        setStepValidation,
      }}
    >
      {children}
    </CouncilFormContext.Provider>
  );
}

export const useCouncilForm = () => {
  const context = useContext(CouncilFormContext);
  if (!context) {
    throw new Error('useCouncilForm must be used within CouncilFormProvider');
  }
  return context;
};
