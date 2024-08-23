'use client';

import { useMutation } from '@tanstack/react-query';
import { useToast } from 'hooks';
import { get, map } from 'lodash';
import { useCallback } from 'react';
import { ModuleFunction, SupportedChains, UseCustomToastReturn } from 'types';
import {
  createHatsModulesClient,
  invalidateAfterTransaction,
  transformInput,
} from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

// TODO update to use `usePollSubgraph`

interface CallModuleFunction {
  moduleId?: string;
  instance?: Hex;
  func?: ModuleFunction;
  args: any; // unknown[];
  onSuccess?: () => void;
  onDecline?: () => void;
}

const useCallModuleFunction = ({
  chainId,
}: {
  chainId: SupportedChains | undefined;
}) => {
  const { address } = useAccount();
  const toast: UseCustomToastReturn = useToast();

  const callModuleFunction = useCallback(
    async ({
      moduleId,
      instance,
      func,
      args,
      onSuccess,
      onDecline,
    }: CallModuleFunction) => {
      if (!chainId) throw new Error('Chain ID is undefined');
      if (!address) throw new Error('Address is undefined');

      const moduleClient = await createHatsModulesClient(chainId);
      if (!moduleClient) throw new Error('Failed to create module client');

      const preparedArgs = map(get(func, 'args'), (arg: any) => {
        // strip apostrophes from arg names (react-hook-form, appears to automatically do this)
        const argName = arg.name.replace(/'/g, '');
        const value =
          args[`${argName}-resolved`] || // handle ENS resolution
          args[`${argName}-parsed`] || // handle number parsing
          args[argName];
        const transformedValue = transformInput(value, arg.type);
        return transformedValue;
      });

      try {
        if (!moduleId || !instance || !func)
          throw new Error('Missing required parameters');

        const result = await moduleClient.callInstanceWriteFunction({
          account: address,
          moduleId,
          instance,
          func,
          args: preparedArgs,
        });

        await invalidateAfterTransaction(chainId, result.transactionHash);

        if (result?.status === 'success') {
          toast.success({
            title: 'Transaction confirmed',
            description: 'Your transaction has been confirmed',
          });

          onSuccess?.();
        }

        if (!result) onDecline?.();
      } catch (error: unknown) {
        const err = error as Error;
        // eslint-disable-next-line no-console
        console.log(err);
        toast.error({
          title: 'Transaction failed',
          description: err.message,
        });
      }
    },
    [address, chainId, toast],
  );

  return useMutation({ mutationFn: callModuleFunction });
};

export default useCallModuleFunction;
