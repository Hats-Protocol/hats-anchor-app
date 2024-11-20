'use client';

import { createContext, useContext, useState } from 'react';

interface CouncilFormData {
  organizationName: string;
  councilName: string;
  chain: string;
  description?: string;
  members?: Array<{
    address: string;
    name?: string;
  }>;
  thresholdLogic: 'fixed' | 'percentage';
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
}

const CouncilFormContext = createContext<CouncilFormContextType | undefined>(
  undefined,
);

export function CouncilFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [formData, setFormData] = useState<CouncilFormData>({
    organizationName: '',
    councilName: '',
    chain: '',
    thresholdLogic: 'fixed',
    confirmationsRequired: 4,
    requiredPercentage: 51,
    minMembers: 2,
    maxMembers: 7,
  });
  const [currentStep, setCurrentStep] = useState('details');

  const updateFormData = (newData: Partial<CouncilFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <CouncilFormContext.Provider
      value={{
        formData,
        updateFormData,
        currentStep,
        setCurrentStep,
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
