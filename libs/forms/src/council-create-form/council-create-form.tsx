'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { CouncilDetailsForm } from './council-details-form';
import { MemberSelectionForm } from './member-selection-form';

export const CouncilCreateForm = () => {
  const [step, setStep] = useState(0);
  const mainForm = useForm();

  if (step === 0) {
    return <CouncilDetailsForm mainForm={mainForm} setStep={setStep} />;
  }
  if (step === 1) {
    return <MemberSelectionForm mainForm={mainForm} setStep={setStep} />;
  }

  return <div></div>;
};
