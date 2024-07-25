'use client';

import { Module, ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { ModuleFunction, SupportedChains } from 'types';
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
    (fn: ModuleFunction) => fn.functionName === 'signAgreementAndClaimHat',
  );

  const signFn = _.find(
    _.get(moduleDetails, 'writeFunctions'),
    (fn: ModuleFunction) => fn.functionName === 'signAgreement',
  );

  const { mutate: callModuleFunction } = useCallModuleFunction({
    chainId,
  });

  const handleSignAndClaim = async () => {
    callModuleFunction({
      moduleId: moduleDetails?.implementationAddress,
      instance: controllerAddress as Hex,
      func: signAndClaim as ModuleFunction,
      args: {
        'Claims Hatter': mchAddress,
      },
      onSuccess: onSuccessfulSign,
      onDecline,
    });
  };

  const handleSign = async () => {
    callModuleFunction({
      moduleId: moduleDetails?.implementationAddress,
      instance: controllerAddress as Hex,
      func: signFn as ModuleFunction,
      args: {},
      onSuccess: onSuccessfulSign,
      onDecline,
    });
  };

  return {
    agreement,
    isLoading,
    error,
    signAndClaim: handleSignAndClaim,
    signAgreement: handleSign,
  };
};

export default useAgreementEligibility;
