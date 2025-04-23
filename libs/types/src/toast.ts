type ToastStatus = 'success' | 'error' | 'loading' | 'warning' | 'info';

export interface ToastBaseProps {
  toast: any;
  title: string;
  description?: string;
  iconName?: string;
  status: ToastStatus;
  id?: string;
  duration?: number;
  closeToast: () => void;
  isClosable?: boolean;
}

export interface ToastProps {
  title: string;
  description?: string;
  // icon: React.ReactNode;
  variant?: 'default' | 'destructive';
  status?: ToastStatus;
  closeToast?: () => void;
  duration?: number;
  isClosable?: boolean;
}

export type UseCustomToastReturn = (props: ToastProps) => void;
