import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { fetchIpfs } from 'utils';

interface ContractInteractionProps {
  moduleParameters: ModuleParameter[] | undefined;
}

const useAgreementEligibility = ({
  moduleParameters,
}: ContractInteractionProps) => {
  const ipfsHash = _.find(moduleParameters, {
    label: 'Current Agreement',
  })?.value as string;

  const {
    data: agreement,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['agreement', ipfsHash],
    queryFn: () => fetchIpfs(ipfsHash).then((res) => res?.data),
    enabled: !!ipfsHash,
  });

  return { agreement, isLoading, error };
};

export default useAgreementEligibility;
