import { useClipboard as useChakraClipboard } from '@chakra-ui/react';
import _ from 'lodash';
import { ToastProps } from 'types';

import useToast from './useToast';

interface UseClipboardOptions {
  toastData?: ToastProps;
}

const useClipboard = (value: string, options?: UseClipboardOptions) => {
  const fullReturn = useChakraClipboard(value);
  const toast = useToast();

  const { onCopy } = _.pick(fullReturn, ['onCopy']);
  const { toastData } = _.pick(options, ['toastData']);

  const handleCopy = () => {
    onCopy();
    toast.success(toastData || { title: 'Copied to clipboard' });
  };

  return {
    ...fullReturn,
    handleCopy,
  };
};

export default useClipboard;
