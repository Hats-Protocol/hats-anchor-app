import { useCallback, useState } from 'react';
import { logger } from 'utils';

// import useToast from './use-toast';

type CopiedValue = string | null;

type CopyFn = () => Promise<boolean>;

interface UseClipboardProps {
  toastData?: { title?: string; variant?: 'success' | 'destructive' };
}

export function useClipboard(value: string, { toastData }: UseClipboardProps = {}): { onCopy: CopyFn } {
  const [, setCopiedText] = useState<CopiedValue>(null);

  // TODO handle toast
  // const { toast } = useToast();

  const copy: CopyFn = useCallback(async () => {
    if (!navigator?.clipboard) {
      logger.warn('Clipboard not supported');

      // toast({ title: 'Clipboard not supported', variant: 'destructive' });
      return false;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopiedText(value);

      // toast({ title: 'Copied to clipboard', variant: 'success' });
      return true;
    } catch (error) {
      logger.warn('Copy failed', error);

      // toast({ title: 'Copy failed', variant: 'destructive' });
      setCopiedText(null);
      return false;
    }
  }, [value]);

  return { onCopy: copy };
}
