import { HsgType } from '@hatsprotocol/hsg-sdk';
import { WriteFunction } from '@hatsprotocol/modules-sdk';
import { useMutation } from '@tanstack/react-query';
import { createHatsSignerGateClient, transformInput } from 'app-utils';
import { SupportedChains } from 'hats-types';
import _ from 'lodash';
import { useCallback } from 'react';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const useCallHsgFunction = ({
  chainId,
}: {
  chainId: SupportedChains | undefined;
}) => {
  const { address } = useAccount();

  const callFunction = useCallback(
    async ({
      type,
      instance,
      func,
      args,
    }: {
      type: HsgType;
      instance: Hex;
      func: WriteFunction;
      args: unknown[];
    }) => {
      if (!chainId) throw new Error('Chain ID is undefined');
      if (!address) throw new Error('Address is undefined');

      const signerGateClient = await createHatsSignerGateClient(chainId);
      if (!signerGateClient) throw new Error('Failed to create module client');
      console.log('signerGateClient', signerGateClient);

      console.log('func.args', func.args);
      console.log('args', args);
      const preparedArgs = _.map(func.args, (arg: any) => {
        const value = args[arg.name];
        const transformedValue = transformInput(value, arg.type);
        return transformedValue;
      });
      console.log('preparedArgs', preparedArgs);

      console.log(
        'signerGateClient.callInstanceWriteFunction',
        signerGateClient.callInstanceWriteFunction,
      );

      signerGateClient.callInstanceWriteFunction({
        account: address,
        type,
        instance,
        func,
        args: preparedArgs,
      });
    },
    [address, chainId],
  );

  return useMutation({ mutationFn: callFunction });
};

export default useCallHsgFunction;
