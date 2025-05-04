import { usePrivy } from '@privy-io/react-auth';
import { useQueries } from '@tanstack/react-query';
import { CouncilFormData } from 'types';
import { getBatchOffchainCouncilData } from 'utils';
import { Hex } from 'viem';

interface Council {
  hsg: Hex;
  chainId: number;
}

// TODO align with existing types
type OffchainCouncilData = {
  id: string;
  hsg: string;
  membersSelectionModule: string | undefined;
  membersCriteriaModule: string | undefined;
  creationForm: CouncilFormData;
  organization: {
    name: string;
  };
  // members: CouncilMember[];
  // admins: CouncilMember[];
  // complianceAdmins: CouncilMember[];
  // payer: CouncilPayer;
  treeId: number;
  chain: number;
  deployed: boolean;
};

export const useBatchOffchainCouncilDetails = (councils: Council[]) => {
  const { getAccessToken } = usePrivy();

  const results = useQueries({
    queries: councils.map((council) => ({
      queryKey: ['offchainCouncilData', { chainId: council.chainId, hsg: council.hsg }],
      queryFn: async () => {
        const accessToken = await getAccessToken();
        return getBatchOffchainCouncilData({
          council,
          accessToken,
        });
      },
      enabled: !!council.hsg && !!council.chainId,
      refetchOnMount: true,
      staleTime: 0,
    })),
  });

  return {
    data: results.map((result) => result.data as OffchainCouncilData | null),
    isLoading: results.some((result) => result.isLoading),
    isError: results.some((result) => result.isError),
    queries: results.map((result) => ({
      isLoading: result.isLoading,
      isError: result.isError,
      error: result.error,
      isFetching: result.isFetching,
    })),
  };
};
