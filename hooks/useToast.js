/* eslint-disable react/jsx-props-no-spreading */
import { useToast as useChakraToast, Toast } from '@chakra-ui/react';
import _ from 'lodash';
import React, { useRef } from 'react';

const ToastBase = ({
  toast,
  title,
  description,
  iconName,
  status,
  id,
  duration,
  closeToast,
  ...props // gets the rest of the original Chakra Toast props (such as isClosable)
}) => {
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
        iconName={iconName}
        status={status}
        closeToast={closeToast}
        {...props}
      />
    ),
  });
};

const useCustomToast = () => {
  const toast = useChakraToast();
  const toastIdRef = useRef(null);

  function closeToast() {
    if (toastIdRef.current) {
      toast.close(toastIdRef.current);
    }
  }

  return {
    success(props) {
      toastIdRef.current = ToastBase({
        ...props,
        status: 'success',
        closeToast,
        isClosable: props.isClosable ?? false,
        toast,
      });
    },
    error(props) {
      toastIdRef.current = ToastBase({
        ...props,
        status: 'error',
        closeToast,
        isClosable: props.isClosable ?? false,
        toast,
      });
    },
    warning(props) {
      toastIdRef.current = ToastBase({
        ...props,
        status: 'warning',
        closeToast,
        isClosable: props.isClosable ?? false,
        toast,
      });
    },
    loading(props) {
      toastIdRef.current = ToastBase({
        ...props,
        status: 'loading',
        closeToast,
        isClosable: props.isClosable ?? false,
        toast,
      });
    },
    info(props) {
      toastIdRef.current = ToastBase({
        ...props,
        status: 'info',
        closeToast,
        isClosable: props.isClosable ?? false,
        toast,
      });
    },
  };
};

export default useCustomToast;
