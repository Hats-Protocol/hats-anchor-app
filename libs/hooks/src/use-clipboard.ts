import { useClipboard as useChakraClipboard } from '@chakra-ui/react';
import { pick } from 'lodash';
import { ToastProps } from 'types';

import { useToast } from './use-toast';

interface UseClipboardOptions {
  toastData?: ToastProps;
}

const useClipboard = (value: string, options?: UseClipboardOptions) => {
  const fullReturn = useChakraClipboard(value);
  const toast = useToast();

  const { onCopy } = pick(fullReturn, ['onCopy']);
  const { toastData } = pick(options, ['toastData']);
  const { status } = pick(toastData, ['status']);

  const handleCopy = () => {
    onCopy();
    toast[status || 'success'](toastData || { title: 'Copied to clipboard' });
  };

  return {
    ...fullReturn,
    chakraOnCopy: onCopy,
    onCopy: handleCopy,
  };
};

export { useClipboard };
