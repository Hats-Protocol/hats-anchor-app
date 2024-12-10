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
}

interface CouncilFormResponse {
  councilCreationForm: {
    organizationName: string | null;
    councilName: string | null;
    chain: number | null;
    councilDescription: string | null;
    thresholdType: 'ABSOLUTE' | 'RELATIVE';
    thresholdTarget: number;
    thresholdMin: number;
    maxCouncilMembers: number;
    membersSelectionType: 'ALLOWLIST' | 'ELECTION';
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
      admins: [],
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
        thresholdType: data.thresholdType,
        confirmationsRequired:
          data.thresholdType === 'ABSOLUTE' ? data.thresholdTarget : 4,
        percentageRequired:
          data.thresholdType === 'RELATIVE' ? data.thresholdTarget : 51,
        minConfirmations: data.thresholdMin,
        maxMembers: data.maxCouncilMembers,
        membershipType:
          data.membersSelectionType === 'ELECTION' ? 'ELECTED' : 'APPOINTED',
        requirements: data.memberRequirements || {
          signAgreement: false,
          holdTokens: false,
          passCompliance: false,
        },
        members: data.members || [],
        admins: data.admins || [],
      };
      console.log('Setting form to:', newValues);
      form.reset(newValues);
    }
  }, [data, form]);

  const queryClient = useQueryClient();

  const { mutateAsync: persistForm } = useMutation({
    mutationFn: async () => {
      const formData = form.getValues();
      console.log('Persisting form data:', formData);
      const payload = {
        id: draftId,
        organizationName: formData.organizationName,
        councilName: formData.councilName,
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
        membersSelectionType:
          formData.membershipType === 'ELECTED' ? 'ELECTION' : 'ALLOWLIST',
        members: formData.members,
        admins: formData.admins,
        memberRequirements: formData.requirements,
        agreement: formData.requirements.signAgreement ? '' : undefined,
      };

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
