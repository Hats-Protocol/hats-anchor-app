'use client';

import { createContext, useContext, useEffect, useState } from 'react';

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
  currentStep: string;
  setCurrentStep: (step: string) => void;
  isLoading: boolean;
  persistForm: () => Promise<void>;
}

const CouncilFormContext = createContext<CouncilFormContextType | undefined>(
  undefined,
);

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
  const [currentStep, setCurrentStep] = useState('details');
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (newData: Partial<CouncilFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    console.log('formData', formData);
  };

  const loadFormData = async (id: string) => {
    setIsLoading(true);
    try {
      const result: {
        councilCreationForm: {
          id: string;
          thresholdType: 'ABSOLUTE' | 'RELATIVE';
          maxCouncilMembers: number;
          thresholdTarget: number;
          thresholdMin: number;
          organizationName: string | null;
          councilName: string | null;
          councilDescription: string | null;
          membersSelectionType: 'ALLOWLIST' | 'ELECTION';
          chain: number | null;
          collaborators: string[];
        };
      } = await graphqlClient.request(GET_COUNCIL_FORM, { id });
      const form = result.councilCreationForm;
      console.log('loaded form', form);

      setFormData((prev) => ({
        ...prev,
        councilName: form.councilName,
        organizationName: form.organizationName,
        chain: chainIdToString(form.chain),
        councilDescription: form.councilDescription,
        thresholdType: form.thresholdType,
        confirmationsRequired:
          form.thresholdType === 'ABSOLUTE'
            ? form.thresholdTarget
            : prev.confirmationsRequired,
        requiredPercentage:
          form.thresholdType === 'RELATIVE'
            ? form.thresholdTarget
            : prev.percentageRequired,
        minConfirmations: form.thresholdMin,
        maxMembers: form.maxCouncilMembers,
      }));
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const persistForm = async () => {
    if (!draftId) {
      console.log('No draftId found');
      return;
    }

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

    console.log('Mutation payload:', payload);
    setIsLoading(true);

    try {
      const result = await graphqlClient.request(UPDATE_COUNCIL_FORM, payload);
      console.log('GraphQL Response:', result);
    } catch (error: any) {
      console.error('GraphQL Error:', error);
      if (error.response) {
        console.error('GraphQL Response Errors:', error.response.errors);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (draftId) {
      loadFormData(draftId);
    }
  }, [draftId]);

  return (
    <CouncilFormContext.Provider
      value={{
        formData,
        updateFormData,
        currentStep,
        setCurrentStep,
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
