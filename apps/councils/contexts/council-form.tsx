'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { graphqlClient } from '../lib/graphql-client';
import {
  GET_COUNCIL_FORM,
  UPDATE_COUNCIL_FORM,
} from '../lib/graphql/council-form';

interface CouncilFormData {
  organizationName: string | null;
  councilName: string | null;
  chain: string | null;
  description?: string | null;
  thresholdLogic: 'ABSOLUTE' | 'RELATIVE';
  confirmationsRequired: number;
  requiredPercentage?: number;
  minMembers: number;
  maxMembers: number;
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
  const [formData, setFormData] = useState<CouncilFormData>({
    organizationName: null,
    councilName: null,
    chain: null,
    thresholdLogic: 'ABSOLUTE',
    confirmationsRequired: 4,
    requiredPercentage: 51,
    minMembers: 2,
    maxMembers: 7,
  });
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
        thresholdLogic: form.thresholdType,
        confirmationsRequired:
          form.thresholdType === 'ABSOLUTE'
            ? form.thresholdTarget
            : prev.confirmationsRequired,
        requiredPercentage:
          form.thresholdType === 'RELATIVE'
            ? form.thresholdTarget
            : prev.requiredPercentage,
        minMembers: form.thresholdMin,
        maxMembers: form.maxCouncilMembers,
        councilName: form.councilName,
        organizationName: form.organizationName,
      }));
      console.log('formData after load', formData);
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
      thresholdType: formData.thresholdLogic,
      maxCouncilMembers: formData.maxMembers,
      thresholdTarget:
        formData.thresholdLogic === 'ABSOLUTE'
          ? formData.confirmationsRequired
          : formData.requiredPercentage,
      thresholdMin: formData.minMembers,
      councilName: formData.councilName,
      organizationName: formData.organizationName,
      councilDescription: formData.description,
    };

    console.log('Mutation payload:', payload);
    setIsLoading(true);

    try {
      const result = await graphqlClient.request(UPDATE_COUNCIL_FORM, payload);
      console.log('GraphQL Response:', result);
    } catch (error) {
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
