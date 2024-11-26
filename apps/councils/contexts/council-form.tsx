'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState, useRef } from 'react';

import { chainIdToString, chainStringToId } from '../lib/chain-mapping';
import {
  GET_COUNCIL_FORM,
  UPDATE_COUNCIL_FORM,
} from '../lib/graphql/council-form';
import { graphqlClient } from '../lib/graphql-client';

interface CouncilFormData {
  // step 1
  organizationName: string | null;
  councilName: string | null;
  chain: string | null;
  councilDescription: string | null;
  // step 2
  thresholdType: 'ABSOLUTE' | 'RELATIVE';
  confirmationsRequired: number; // used if thresholdType is ABSOLUTE
  percentageRequired: number; // used if thresholdType is RELATIVE
  minConfirmations: number; // used if thresholdType is RELATIVE.
  maxMembers: number;
  // step 3 - onboarding
  membershipType: 'APPOINTED' | 'ELECTED';
  requirements: {
    signAgreement: boolean;
    holdTokens: boolean;
    passCompliance: boolean;
  };
}

interface CouncilFormContextType {
  formData: CouncilFormData;
  updateFormData: (data: Partial<CouncilFormData>) => void;
  isLoading: boolean;
  persistForm: () => Promise<void>;
}

const CouncilFormContext = createContext<CouncilFormContextType | undefined>(
  undefined,
);

// Add interface for the GraphQL response
interface CouncilFormResponse {
  councilCreationForm: {
    councilName: string | null;
    organizationName: string | null;
    chain: number;
    councilDescription: string | null;
    thresholdType: 'ABSOLUTE' | 'RELATIVE';
    thresholdTarget: number;
    thresholdMin: number;
    maxCouncilMembers: number;
  };
}

export function CouncilFormProvider({
  children,
  draftId,
}: {
  children: React.ReactNode;
  draftId: string;
}) {
  const initialFormData: CouncilFormData = {
    organizationName: null,
    councilName: null,
    chain: null,
    councilDescription: null,
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
  };
  const [formData, setFormData] = useState<CouncilFormData>(initialFormData);
  const isInitialLoadRef = useRef(true);

  const updateFormData = (newData: Partial<CouncilFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    console.log('formData', formData);
  };

  const { isLoading, data } = useQuery({
    queryKey: ['councilForm', draftId],
    queryFn: async () => {
      const result = await graphqlClient.request<CouncilFormResponse>(
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
    if (data && isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      setFormData((prev) => ({
        ...prev,
        councilName: data.councilName,
        organizationName: data.organizationName,
        chain: chainIdToString(data.chain),
        councilDescription: data.councilDescription,
        thresholdType: data.thresholdType,
        confirmationsRequired:
          data.thresholdType === 'ABSOLUTE'
            ? data.thresholdTarget
            : prev.confirmationsRequired,
        percentageRequired:
          data.thresholdType === 'RELATIVE'
            ? data.thresholdTarget
            : prev.percentageRequired,
        minConfirmations: data.thresholdMin,
        maxMembers: data.maxCouncilMembers,
      }));
    }
  }, [data]);

  const queryClient = useQueryClient();

  const { mutateAsync: persistForm } = useMutation({
    mutationFn: async () => {
      const payload = {
        id: draftId,
        councilName: formData.councilName,
        organizationName: formData.organizationName,
        councilDescription: formData.councilDescription,
        chain: chainStringToId(formData.chain),
        thresholdType: formData.thresholdType,
        maxCouncilMembers: formData.maxMembers,
        thresholdTarget:
          formData.thresholdType === 'ABSOLUTE'
            ? formData.confirmationsRequired
            : formData.percentageRequired,
        thresholdMin:
          formData.thresholdType === 'ABSOLUTE'
            ? formData.confirmationsRequired
            : formData.minConfirmations,
      };

      return await graphqlClient.request(UPDATE_COUNCIL_FORM, payload);
    },
    onSuccess: () => {
      // Invalidate and refetch the form data
      queryClient.invalidateQueries({ queryKey: ['councilForm', draftId] });
    },
  });

  return (
    <CouncilFormContext.Provider
      value={{
        formData,
        updateFormData,
        isLoading,
        persistForm: async () => {
          await persistForm();
        },
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
