import { useMutation } from '@tanstack/react-query';
import { useToast, useWaitForSubgraph } from 'hooks';
import { get, map } from 'lodash';
import { useCallback } from 'react';
import { ModuleFunction, SupportedChains } from 'types';
import { createHatsModulesClient, invalidateAfterTransaction, transformInput, wagmiConfig } from 'utils';
import { Hex } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';
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

const useCallModuleFunction = ({ chainId }: { chainId: SupportedChains | undefined }) => {
  const { address } = useAccount();
  const { toast } = useToast();
  const { data: walletClient } = useWalletClient();

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const callModuleFunction = useCallback(
    async ({ moduleId, instance, func, args, onSuccess, onDecline }: CallModuleFunction) => {
      console.log('callModuleFunction', { moduleId, instance, func, args, onSuccess, onDecline });
      // TODO errors thrown here are not being caught well (log and toast instead?)
      if (!chainId) throw new Error('Chain ID is undefined');
      if (!address) throw new Error('User address is undefined');
      if (!walletClient) throw new Error('Wallet client is undefined');

      const moduleClient = await createHatsModulesClient(chainId, walletClient);
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

        toast({
          title: 'Transaction pending',
          description: 'Waiting for transaction to be confirmed',
        });

        // TODO prefer passing to `handlePendingTx`?
        const txResult = await waitForTransactionReceipt(wagmiConfig(), {
          chainId,
          hash: result.transactionHash,
        });

        toast({
          title: 'Transaction confirmed',
          description: 'Waiting for the indexer to update',
        });

        await waitForSubgraph(txResult);

        await invalidateAfterTransaction(chainId, result.transactionHash);

        if (result?.status === 'success') {
          toast({
            title: 'Transaction completed',
            description: 'Your transaction has been completed',
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
        toast({
          title: 'Transaction failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
    [address, chainId, waitForSubgraph, walletClient, toast],
  );

  return useMutation({ mutationFn: callModuleFunction });
};

export { useCallModuleFunction };
