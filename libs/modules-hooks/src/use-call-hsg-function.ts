import { HsgType } from '@hatsprotocol/hsg-sdk';
import { WriteFunction } from '@hatsprotocol/modules-sdk';
import { useMutation } from '@tanstack/react-query';
import { useToast } from 'hooks';
import { map, toUpper } from 'lodash';
import { useCallback } from 'react';
import { SupportedChains } from 'types';
import { createHatsSignerGateClient, transformInput } from 'utils';
import { Hex } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';

interface HsgFunctionCallProps {
  type: HsgType;
  instance?: Hex;
  func?: WriteFunction;
  args: any;
  onSuccess?: () => void;
}

const useCallHsgFunction = ({ chainId }: { chainId: SupportedChains | undefined }) => {
  const { address } = useAccount();
  const { toast } = useToast();
  const { data: walletClient } = useWalletClient();

  const callFunction = useCallback(
    async ({ type, instance, func, onSuccess, args }: HsgFunctionCallProps) => {
      if (!chainId) throw new Error('Chain ID is undefined');
      if (!address) throw new Error('Address is undefined');
      if (!instance) throw new Error('Instance is undefined');
      if (!func) throw new Error('Function is undefined');

      const signerGateClient = await createHatsSignerGateClient(chainId, walletClient);
      if (!signerGateClient) throw new Error('Failed to create module client');

      const preparedArgs = map(func.args, (arg: any) => {
        const value = args[`${arg.name}-resolved`] || args[arg.name];
        const transformedValue = transformInput(value, arg.type);
        return transformedValue;
      });

      try {
        const result = await signerGateClient.callInstanceWriteFunction({
          account: address,
          type: toUpper(type) as HsgType,
          instance,
          func,
          args: preparedArgs,
        });

        if (result?.status === 'success') {
          toast({
            title: 'Transaction confirmed',
            description: 'Your transaction has been confirmed',
          });

          onSuccess?.();
        }
      } catch (error) {
        const err = error as Error;
        toast({
          title: 'Transaction failed',
          description: err.message,
          variant: 'destructive',
        });
        // eslint-disable-next-line no-console
        console.log(error);
      }
    },
    [address, chainId, toast],
  );

  return useMutation({ mutationFn: callFunction });
};

export { useCallHsgFunction };
