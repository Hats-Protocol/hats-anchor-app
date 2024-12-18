import { useMutation } from '@tanstack/react-query';
import { useToast, useWaitForSubgraph } from 'hooks';
import { get, map } from 'lodash';
import { useCallback } from 'react';
import { ModuleFunction, SupportedChains, UseCustomToastReturn } from 'types';
import {
  createHatsModulesClient,
  invalidateAfterTransaction,
  transformInput,
  wagmiConfig,
} from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';

// TODO update to use `handlePendingTx`

interface CallModuleFunction {
  moduleId?: string;
  instance?: Hex;
  func?: ModuleFunction;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const callModuleFunction = useCallback(
    async ({
      moduleId,
      instance,
      func,
      args,
      onSuccess,
      onDecline,
    }: CallModuleFunction) => {
      // TODO errors thrown here are not being caught well
      if (!chainId) throw new Error('Chain ID is undefined');
      if (!address) throw new Error('Address is undefined');

      const moduleClient = await createHatsModulesClient(chainId);
      if (!moduleClient) throw new Error('Failed to create module client');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        if (!moduleId || !instance || !func) {
          throw new Error('Missing required parameters');
        }

        const result = await moduleClient.callInstanceWriteFunction({
          account: address,
          moduleId,
          instance,
          func,
          args: preparedArgs,
        });

        if (!get(result, 'transactionHash')) {
          onDecline?.();
          return;
        }

        const txResult = await waitForTransactionReceipt(wagmiConfig, {
          chainId,
          hash: result.transactionHash,
        });

        await waitForSubgraph(txResult);

        await invalidateAfterTransaction(chainId, result.transactionHash);

        if (result?.status === 'success') {
          toast.success({
            title: 'Transaction confirmed',
            description: 'Your transaction has been confirmed',
          });

          onSuccess?.();
        }
      } catch (err: unknown) {
        const error = err as Error;
        if (error.message.includes('User rejected the request')) {
          // eslint-disable-next-line no-console
          console.log('User rejected the request');
          onDecline?.();
          return;
        }
        toast.error({
          title: 'Transaction failed',
          description: error.message,
        });
      }
    },
    [address, chainId, waitForSubgraph, toast],
  );

  return useMutation({ mutationFn: callModuleFunction });
};

export default useCallModuleFunction;
