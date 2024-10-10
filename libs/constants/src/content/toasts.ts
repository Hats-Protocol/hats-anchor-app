import { ToastProps } from 'types';

const TOAST_TYPES = {
  claimHat: 'claimHat',
  claimHatWithAgreement: 'claimHatWithAgreement',
  mintHat: 'mintHat',
};

export type Toast = {
  title: string;
  description?: string;
};

type ToastContent = Partial<{
  [key in keyof typeof TOAST_TYPES]: ToastProps;
}>;

// many of these are interpolated
export const TOASTS: ToastContent = {
  claimHat: {
    title: 'Hat Claimed',
    description: 'Claimed with signature',
  },
  claimHatWithAgreement: {
    title: 'Hat Claimed',
    description: 'Claimed with signature',
  },
};
