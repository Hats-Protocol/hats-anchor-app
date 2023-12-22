import { WriteFunction } from '@hatsprotocol/modules-sdk';
import { useMutation } from '@tanstack/react-query';
import { createHatsModulesClient, transformInput } from 'app-utils';
import { SupportedChains } from 'hats-types';
import _ from 'lodash';
import { useCallback } from 'react';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const useCallModuleFunction = ({
  chainId,
}: {
  chainId: SupportedChains | undefined;
}) => {
  const { address } = useAccount();

  const callFunction = useCallback(
    async ({
      moduleId,
      instance,
      func,
      args,
    }: {
      moduleId: string;
      instance: Hex;
      func: WriteFunction;
      args: any;
    }) => {
      if (!chainId) throw new Error('Chain ID is undefined');
      if (!address) throw new Error('Address is undefined');

      const moduleClient = await createHatsModulesClient(chainId);
      if (!moduleClient) throw new Error('Failed to create module client');

      const preparedArgs = _.map(func.args, (arg: any) => {
        const value = args[arg.name];
        const transformedValue = transformInput(value, arg.type);
        return transformedValue;
      });
      console.log(preparedArgs);

      const result = await moduleClient.callInstanceWriteFunction({
        account: address,
        moduleId,
        instance,
        func,
        args: preparedArgs,
      });
      console.log(result);
    },
    [address, chainId],
  );

  return useMutation({ mutationFn: callFunction });
};

export default useCallModuleFunction;
