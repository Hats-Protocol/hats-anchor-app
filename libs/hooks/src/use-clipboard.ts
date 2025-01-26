import { useCallback, useState } from 'react';
import { logger } from 'utils';

// import useToast from './use-toast';

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

export function useClipboard(): [CopiedValue, CopyFn] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  // const { toast } = useToast();

  const copy: CopyFn = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      logger.warn('Clipboard not supported');

      // toast({ title: 'Clipboard not supported', variant: 'destructive' });
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);

      // toast({ title: 'Copied to clipboard', variant: 'success' });
      return true;
    } catch (error) {
      logger.warn('Copy failed', error);

      // toast({ title: 'Copy failed', variant: 'destructive' });
      setCopiedText(null);
      return false;
    }
  }, []);

  return [copiedText, copy];
}
