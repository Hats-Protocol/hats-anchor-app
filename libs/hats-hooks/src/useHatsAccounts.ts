import { useToast } from 'app-hooks';
import { createHatsAccountClient } from 'app-utils';
import { SupportedChains } from 'hats-types';
import { useEffect, useState } from 'react';
import { Hex } from 'viem';
import { useAccount, useQueryClient } from 'wagmi';

const SALT = BigInt(1);

const useHatsAccounts = ({
  id,
  chainId,
}: {
  id?: string;
  chainId: SupportedChains;
}) => {
  const [predictedAddress, setPredictedAddress] = useState<Hex | null>();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { address } = useAccount();

  useEffect(() => {
    const predictAddress = async () => {
      if (!id || !chainId) return;

      const hatsAccountClient = await createHatsAccountClient(chainId);
      if (!hatsAccountClient) return;

      try {
        const predictedAccount = await hatsAccountClient.predictAccountAddress({
          hatId: BigInt(id),
          salt: SALT,
        });
        setPredictedAddress(predictedAccount);
      } catch (error) {
        console.error('Error predicting Hats account address:', error);
      }
    };

    predictAddress();
  }, [id, chainId]);

  async function createAccount() {
    if (!id || !chainId) return;

    const hatsAccountClient = await createHatsAccountClient(chainId);
    if (!hatsAccountClient) return;

    try {
      await hatsAccountClient.createAccount({
        account: address as Hex,
        hatId: BigInt(id),
        salt: SALT,
      });

      toast.info({
        title: 'Transaction successful',
        description: 'The hats wallet account has been successfully deployed',
      });

      queryClient.invalidateQueries(['hatDetails', { id, chainId }]);
    } catch (error) {
      toast.error({
        title: 'Transaction failed',
        description: 'The hats wallet account deployment failed',
      });
    }
  }

  return {
    predictedAddress,
    createAccount,
  };
};

export default useHatsAccounts;
