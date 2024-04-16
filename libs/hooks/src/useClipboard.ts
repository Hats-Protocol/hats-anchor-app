import { useClipboard as useChakraClipboard } from '@chakra-ui/react';
import _ from 'lodash';
import { ToastProps } from 'types';

import useToast from './useToast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface UseClipboardOptions {
  toastData?: ToastProps;
  toastType?: ToastType; // success is default so is optional
}

const useClipboard = (value: string, options?: UseClipboardOptions) => {
  const fullReturn = useChakraClipboard(value);
  const toast = useToast();

  const { onCopy } = _.pick(fullReturn, ['onCopy']);
  const { toastData, toastType } = _.pick(options, ['toastData', 'toastType']);

  const handleCopy = () => {
    onCopy();
    toast[(toastType as ToastType) || 'success'](
      toastData || { title: 'Copied to clipboard' },
    );
  };

  return {
    ...fullReturn,
    handleCopy,
  };
};

export default useClipboard;
