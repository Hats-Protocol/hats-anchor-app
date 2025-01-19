import { HATS_ACCOUNT_1OFN_IMPLEMENTATION } from '@hatsprotocol/hats-account-sdk';
import { useQuery } from '@tanstack/react-query';
import { useToast } from 'hooks';
import _ from 'lodash';
import { SupportedChains } from 'types';
import { createHatsAccountClient } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const SALT = BigInt(1);

const getPredictedAddress = async ({
  hatId,
  chainId,
}: {
  hatId: Hex | undefined;
  chainId: SupportedChains | undefined;
}) => {
  const isSupportedChain = _.has(HATS_ACCOUNT_1OFN_IMPLEMENTATION, _.toString(chainId));
  if (!hatId || hatId === '0x' || !chainId || !isSupportedChain) return null;

  const hatsAccountClient = await createHatsAccountClient(chainId);
  if (!hatsAccountClient) return null;

  try {
    const predictedAccount = await hatsAccountClient.predictAccountAddress({
      hatId: BigInt(hatId),
      salt: SALT,
    });
    return predictedAccount;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error predicting Hats account address:', error);
    return null;
  }
};

const useHatsAccounts = ({ hatId, chainId }: { hatId?: Hex; chainId: SupportedChains | undefined }) => {
  // const queryClient = useQueryClient();
  const toast = useToast();
  const { address } = useAccount();

  const {
    data: predictedAddress,
    isLoading: addressIsLoading,
    error: predictedAddressError,
  } = useQuery({
    queryKey: ['predictedAddress', hatId, chainId],
    queryFn: () => getPredictedAddress({ hatId, chainId }),
    enabled: !!hatId && !!chainId,
    staleTime: Infinity,
  });

  async function createAccount() {
    const isSupportedChain = _.has(HATS_ACCOUNT_1OFN_IMPLEMENTATION, _.toString(chainId));
    if (!hatId || !address || !chainId || !isSupportedChain) return undefined;

    const hatsAccountClient = await createHatsAccountClient(chainId);
    if (!hatsAccountClient) return undefined;

    try {
      await hatsAccountClient.createAccount({
        account: address as Hex,
        hatId: BigInt(hatId),
        salt: SALT,
      });

      toast.info({
        title: 'Transaction successful',
        description: 'The hats wallet account has been successfully deployed',
      });

      // queryClient.invalidateQueries(['hatDetails', { id, chainId }]);
      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      toast.error({
        title: 'Transaction failed',
        description: 'The hats wallet account deployment failed',
      });
      return undefined;
    }
  }

  return {
    predictedAddress,
    addressIsLoading,
    predictedAddressError,
    createAccount,
  };
};

export { useHatsAccounts };
