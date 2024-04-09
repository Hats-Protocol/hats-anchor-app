import { useClipboard as useChakraClipboard } from '@chakra-ui/react';
import _ from 'lodash';
import { ToastProps } from 'types';

import useToast from './useToast';

interface UseClipboardOptions {
  toastData?: ToastProps;
  toastType?: 'success' | 'error' | 'warning' | 'info'; // success is default so is optional
}

const useClipboard = (value: string, options?: UseClipboardOptions) => {
  const fullReturn = useChakraClipboard(value);
  const toast = useToast();

  const { onCopy } = _.pick(fullReturn, ['onCopy']);
  const { toastData, toastType } = _.pick(options, ['toastData', 'toastType']);

  const handleCopy = () => {
    onCopy();
    toast[toastType || 'success'](
      toastData || { title: 'Copied to clipboard' },
    );
  };

  return {
    ...fullReturn,
    handleCopy,
  };
};

export default useClipboard;
