/* eslint-disable react/jsx-props-no-spreading */
import {
  CreateToastFnReturn,
  ToastId,
  useToast as useChakraToast,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useRef } from 'react';

import Toast from './components/Toast';

const ToastBase = ({
  toast,
  title,
  description,
  // iconName,
  status = 'success',
  id,
  duration,
  closeToast,
  isClosable = true,
  ...props // gets the rest of the original Chakra Toast props (such as isClosable)
}: ToastBaseProps) => {
  return toast({
    title,
    description,
    status,
    id,
    duration: duration ?? 3000,
    position: 'top-right',
    isClosable,
    ...props,
    render: () => (
      <Toast
        title={_.toString(title) || ''}
        description={description}
        // icon={<Icon as={iconName}
        status={status}
        closeToast={closeToast}
        isClosable={isClosable}
        {...props}
      />
    ),
  });
};

// app-hooks
const useCustomToast = () => {
  const toast = useChakraToast();
  const toastIdRef = useRef<ToastId | null>(null);

  function closeToast() {
    if (toastIdRef.current) {
      toast.close(toastIdRef.current);
    }
  }

  return {
    success(props: ToastProps) {
      toastIdRef.current = ToastBase({
        ...props,
        status: 'success',
        closeToast,
        iconName: 'crown',
        isClosable: props.isClosable ?? true,
        toast,
      });
    },
    error(props: ToastProps) {
      toastIdRef.current = ToastBase({
        ...props,
        status: 'error',
        closeToast,
        iconName: 'alert',
        isClosable: props.isClosable ?? true,
        toast,
      });
    },
    warning(props: ToastProps) {
      toastIdRef.current = ToastBase({
        ...props,
        status: 'warning',
        closeToast,
        iconName: 'warning',
        isClosable: props.isClosable ?? true,
        toast,
      });
    },
    loading(props: ToastProps) {
      toastIdRef.current = ToastBase({
        ...props,
        status: 'loading',
        closeToast,
        iconName: 'bell',
        isClosable: props.isClosable ?? true,
        toast,
      });
    },
    info(props: ToastProps) {
      toastIdRef.current = ToastBase({
        ...props,
        status: 'info',
        closeToast,
        iconName: 'rocket',
        isClosable: props.isClosable ?? true,
        toast,
      });
    },
  };
};

export default useCustomToast;

interface ToastBaseProps {
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

interface ToastProps {
  title: string;
  description?: string;
  // icon: React.ReactNode;
  status?: 'success' | 'error' | 'warning' | 'loading' | 'info';
  closeToast?: () => void;
  duration?: number;
  isClosable?: boolean;
}
