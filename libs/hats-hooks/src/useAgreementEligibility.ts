import { CONFIG } from '@hatsprotocol/constants';
import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { SupportedChains } from 'hats-types';
import _ from 'lodash';
import { fetchIpfs } from 'utils';
import { Hex } from 'viem';

import useCallModuleFunction from './useCallModuleFunction';
import useHatsModules from './useHatsModules';

interface ContractInteractionProps {
  moduleParameters: ModuleParameter[] | undefined;
  moduleDetails?: Module | undefined;
  chainId?: SupportedChains | undefined;
  controllerAddress?: string | undefined;
  onSuccessfulSign?: () => void;
}

const useAgreementEligibility = ({
  moduleParameters,
  moduleDetails,
  chainId,
  controllerAddress,
  onSuccessfulSign,
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

  const signFn = _.find(
    _.get(moduleDetails, 'writeFunctions'),
    (fn: any) => fn.functionName === 'signAgreement',
  );

  const signAndClaim = _.find(
    _.get(moduleDetails, 'writeFunctions'),
    (fn: any) => fn.functionName === 'signAgreementAndClaimHat',
  );

  const { mutate: callModuleFunction, isLoading: isSignAgreementLoading } =
    useCallModuleFunction({
      chainId,
    });

  const handleSign = async () => {
    callModuleFunction({
      moduleId: moduleDetails?.implementationAddress,
      instance: controllerAddress as Hex,
      func: signFn,
      args: [],
      onSuccess: onSuccessfulSign,
    });
  };

  const { modules } = useHatsModules({ chainId });
  const mch = _.find(modules, { name: CONFIG.claimsHatterModuleName });

  const handleSignAndClaim = async () => {
    callModuleFunction({
      moduleId: moduleDetails?.implementationAddress,
      instance: controllerAddress as Hex,
      func: signAndClaim,
      args: [mch?.implementationAddress],
      onSuccess: onSuccessfulSign,
    });
  };

  return {
    agreement,
    isLoading,
    error,
    signAgreement: handleSign,
    signAndClaim: handleSignAndClaim,
    isSignAgreementLoading,
  };
};

export default useAgreementEligibility;
