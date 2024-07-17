import { CreateToastFnReturn } from '@chakra-ui/react';

export interface ToastBaseProps {
  toast: CreateToastFnReturn;
  title: string;
  description?: string;
  iconName?: string;
  status: 'success' | 'error' | 'warning' | 'loading' | 'info';
  id?: string;
  duration?: number;
  closeToast: () => void;
  isClosable?: boolean;
}

type ToastStatus = 'success' | 'error' | 'loading' | 'warning' | 'info';

export interface ToastProps {
  title: string;
  description?: string;
  // icon: React.ReactNode;
  status?: ToastStatus;
  closeToast?: () => void;
  duration?: number;
  isClosable?: boolean;
}

export interface UseCustomToastReturn {
  success: (props: ToastProps) => void;
  error: (props: ToastProps) => void;
  warning: (props: ToastProps) => void;
  loading: (props: ToastProps) => void;
  info: (props: ToastProps) => void;
}
