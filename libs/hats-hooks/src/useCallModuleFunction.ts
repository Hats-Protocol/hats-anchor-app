import { WriteFunction } from '@hatsprotocol/modules-sdk';
import { useMutation } from '@tanstack/react-query';
import { SupportedChains } from 'types';
import { useToast } from 'hooks';
import _ from 'lodash';
import { useCallback } from 'react';
import { createHatsModulesClient, transformInput } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const useCallModuleFunction = ({
  chainId,
}: {
  chainId: SupportedChains | undefined;
}) => {
  const { address } = useAccount();
  const toast = useToast();

  const callFunction = useCallback(
    async ({
      moduleId,
      instance,
      func,
      args,
      onSuccess,
    }: {
      moduleId?: string;
      instance?: Hex;
      func?: WriteFunction;
      args: any;
      onSuccess?: () => void;
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
