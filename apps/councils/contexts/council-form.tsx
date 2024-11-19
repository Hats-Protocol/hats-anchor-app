'use client';

import { createContext, useContext, useState } from 'react';

interface CouncilFormData {
  organizationName: string;
  councilName: string;
  chain: string;
  description?: string;
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
