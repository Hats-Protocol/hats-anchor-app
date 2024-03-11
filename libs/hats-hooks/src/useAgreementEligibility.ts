import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { SupportedChains } from 'types';
import { fetchIpfs } from 'utils';
import { Hex } from 'viem';

import useCallModuleFunction from './useCallModuleFunction';

interface ContractInteractionProps {
  moduleParameters: ModuleParameter[] | undefined;
  moduleDetails?: Module | undefined;
  chainId?: SupportedChains | undefined;
  controllerAddress?: string | undefined;
  onSuccessfulSign?: () => void;
  mchAddress?: Hex | undefined;
  onDecline?: () => void;
}

const useAgreementEligibility = ({
  moduleParameters,
  moduleDetails,
  chainId,
  controllerAddress,
  onSuccessfulSign,
  mchAddress,
  onDecline,
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

  const signAndClaim = _.find(
    _.get(moduleDetails, 'writeFunctions'),
    (fn: any) => fn.functionName === 'signAgreementAndClaimHat',
  );

  const { mutate: callModuleFunction, isLoading: isSignAgreementLoading } =
    useCallModuleFunction({
      chainId,
    });

  const handleSignAndClaim = async () => {
    callModuleFunction({
      moduleId: moduleDetails?.implementationAddress,
      instance: controllerAddress as Hex,
      func: signAndClaim,
      args: {
        'Claims Hatter': mchAddress,
      },
      onSuccess: onSuccessfulSign,
      onDecline,
    });
  };

  return {
    agreement,
    isLoading,
    error,
    signAndClaim: handleSignAndClaim,
    isSignAgreementLoading,
  };
};

export default useAgreementEligibility;
