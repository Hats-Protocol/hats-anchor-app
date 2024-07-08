const TOAST_TYPES = {
  claimHat: 'claimHat',
  claimHatWithAgreement: 'claimHatWithAgreement',
  mintHat: 'mintHat',
};

type ToastContent = Partial<{
  [key in keyof typeof TOAST_TYPES]: {
    title: string;
    description?: string;
  };
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
