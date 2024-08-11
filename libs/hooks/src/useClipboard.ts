'use client';

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
  const { status } = _.pick(toastData, ['status']);

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

export default useClipboard;
