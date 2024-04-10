import { useMutation } from '@tanstack/react-query';
import { useToast } from 'hooks';
import _ from 'lodash';
import { useCallback } from 'react';
import { AppWriteFunction, SupportedChains, UseCustomToastReturn } from 'types';
import { createHatsModulesClient, transformInput } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

// TODO update to use `usePollSubgraph`

const useCallModuleFunction = ({
  chainId,
}: {
  chainId: SupportedChains | undefined;
}) => {
  const { address } = useAccount();
  const toast: UseCustomToastReturn = useToast();

  const callFunction = useCallback(
    async ({
      moduleId,
      instance,
      func,
      args,
      onSuccess,
      onDecline,
    }: {
      moduleId?: string;
      instance?: Hex;
      func?: AppWriteFunction;
      args: any;
      onSuccess?: () => void;
      onDecline?: () => void;
    }) => {
      if (!chainId) throw new Error('Chain ID is undefined');
      if (!address) throw new Error('Address is undefined');

      const moduleClient = await createHatsModulesClient(chainId);
      if (!moduleClient) throw new Error('Failed to create module client');

      const preparedArgs = _.map(_.get(func, 'args'), (arg: any) => {
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

        if (result?.status === 'success') {
          toast.success({
            title: 'Transaction confirmed',
            description: 'Your transaction has been confirmed',
          });

          onSuccess?.();
        }

        if (!result) onDecline?.();
      } catch (error) {
        const err = error as Error;
        toast.error({
          title: 'Transaction failed',
          description: err.message,
        });
        // eslint-disable-next-line no-console
        console.log(error);
      }
    },
    [address, chainId, toast],
  );

  return useMutation({ mutationFn: callFunction });
};

export default useCallModuleFunction;
