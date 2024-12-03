'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import {
  chainIdToString,
  chainStringToId,
  councilsGraphqlClient,
  GET_COUNCIL_FORM,
  UPDATE_COUNCIL_FORM,
} from 'utils';

interface CouncilMember {
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
}

interface CouncilFormResponse {
  councilCreationForm: {
    councilName: string | null;
    organizationName: string | null;
    chain: number | null;
    councilDescription: string | null;
    thresholdType: 'ABSOLUTE' | 'RELATIVE';
    thresholdTarget: number;
    thresholdMin: number;
    maxCouncilMembers: number;
    membersSelectionType: 'ALLOWLIST' | 'ELECTION';
    membersAllowlist: {
      admins: string[];
      members: string[];
    } | null;
    agreementCriteria: {
      agreement: string;
    } | null;
    tokenCriteria: {
      id: string;
    } | null;
    kycCriteria: {
      verifiers: string[];
    } | null;
  };
}

interface CouncilFormContextType {
  form: UseFormReturn<CouncilFormData>;
  isLoading: boolean;
  persistForm: () => Promise<unknown>;
}

const CouncilFormContext = createContext<CouncilFormContextType | undefined>(
  undefined,
);

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
    },
  });

  const { isLoading, data } = useQuery({
    queryKey: ['councilForm', draftId],
    queryFn: async () => {
      const result = await councilsGraphqlClient.request<CouncilFormResponse>(
        GET_COUNCIL_FORM,
        {
          id: draftId,
        },
      );
      return result.councilCreationForm;
    },
    enabled: !!draftId,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data) {
      form.reset({
        organizationName: data.organizationName || '',
        councilName: data.councilName || '',
        chain: chainIdToString(data.chain) || undefined,
        councilDescription: data.councilDescription || '',
        thresholdType: data.thresholdType,
        confirmationsRequired:
          data.thresholdType === 'ABSOLUTE' ? data.thresholdTarget : 4,
        percentageRequired:
          data.thresholdType === 'RELATIVE' ? data.thresholdTarget : 51,
        minConfirmations: data.thresholdMin,
        maxMembers: data.maxCouncilMembers,
        membershipType: 'APPOINTED',
        requirements: {
          signAgreement: !!data.agreementCriteria,
          holdTokens: !!data.tokenCriteria,
          passCompliance: !!data.kycCriteria,
        },
        members: [],
      });
    }
  }, [data, form]);

  const queryClient = useQueryClient();

  const { mutateAsync: persistForm } = useMutation({
    mutationFn: async () => {
      const formData = form.getValues();
      const payload = {
        id: draftId,
        councilName: formData.councilName,
        organizationName: formData.organizationName,
        councilDescription: formData.councilDescription,
        chain: chainStringToId(formData.chain),
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
        membersSelectionType: 'ALLOWLIST',
        membersAllowlist: {
          admins: [],
          members: [],
        },
        agreementCriteria: formData.requirements.signAgreement
          ? { agreement: '' }
          : null,
        tokenCriteria: formData.requirements.holdTokens
          ? { placeholder: true }
          : null,
        kycCriteria: formData.requirements.passCompliance
          ? { verifiers: [] }
          : null,
      };

      return await councilsGraphqlClient.request(UPDATE_COUNCIL_FORM, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['councilForm', draftId] });
    },
  });

  return (
    <CouncilFormContext.Provider
      value={{
        form,
        isLoading,
        persistForm,
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
