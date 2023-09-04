/* eslint-disable react/jsx-props-no-spreading */
import { ToastId, useToast as useChakraToast } from '@chakra-ui/react';
import _ from 'lodash';
import { useRef } from 'react';

import Toast from '@/components/atoms/Toast';

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
    duration: duration ?? 5000,
    position: 'top-right',
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
        isClosable: props.isClosable ?? false,
        toast,
      });
    },
    error(props: ToastProps) {
      toastIdRef.current = ToastBase({
        ...props,
        status: 'error',
        closeToast,
        iconName: 'alert',
        isClosable: props.isClosable ?? false,
        toast,
      });
    },
    warning(props: ToastProps) {
      toastIdRef.current = ToastBase({
        ...props,
        status: 'warning',
        closeToast,
        iconName: 'warning',
        isClosable: props.isClosable ?? false,
        toast,
      });
    },
    loading(props: ToastProps) {
      toastIdRef.current = ToastBase({
        ...props,
        status: 'loading',
        closeToast,
        iconName: 'bell',
        isClosable: props.isClosable ?? false,
        toast,
      });
    },
    info(props: ToastProps) {
      toastIdRef.current = ToastBase({
        ...props,
        status: 'info',
        closeToast,
        iconName: 'rocket',
        isClosable: props.isClosable ?? false,
        toast,
      });
    },
  };
};

export default useCustomToast;

interface ToastBaseProps {
  toast: any;
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
  isClosable?: boolean;
}
