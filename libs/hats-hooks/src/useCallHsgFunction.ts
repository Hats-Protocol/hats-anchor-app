import { HsgType } from '@hatsprotocol/hsg-sdk';
import { WriteFunction } from '@hatsprotocol/modules-sdk';
import { useMutation } from '@tanstack/react-query';
import { useToast } from 'hooks';
import { SupportedChains } from 'hats-types';
import _ from 'lodash';
import { useCallback } from 'react';
import { createHatsSignerGateClient, transformInput } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const useCallHsgFunction = ({
  chainId,
}: {
  chainId: SupportedChains | undefined;
}) => {
  const { address } = useAccount();
  const toast = useToast();

  const callFunction = useCallback(
    async ({
      type,
      instance,
      func,
      onSuccess,
      args,
    }: {
      type: HsgType;
      instance?: Hex;
      func?: WriteFunction;
      args: any;
      onSuccess?: () => void;
    }) => {
      if (!chainId) throw new Error('Chain ID is undefined');
      if (!address) throw new Error('Address is undefined');
      if (!instance) throw new Error('Instance is undefined');
      if (!func) throw new Error('Function is undefined');

      const signerGateClient = await createHatsSignerGateClient(chainId);
      if (!signerGateClient) throw new Error('Failed to create module client');

      const preparedArgs = _.map(func.args, (arg: any) => {
        const value = args[`${arg.name}-resolved`] || args[arg.name];
        const transformedValue = transformInput(value, arg.type);
        return transformedValue;
      });

      try {
        const result = await signerGateClient.callInstanceWriteFunction({
          account: address,
          type: _.toUpper(type) as HsgType,
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

export default useCallHsgFunction;
