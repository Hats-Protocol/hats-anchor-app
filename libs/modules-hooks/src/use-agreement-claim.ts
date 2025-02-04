import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { useQuery } from '@tanstack/react-query';
import { find, get } from 'lodash';
import { ModuleDetails, ModuleFunction, SupportedChains } from 'types';
import { fetchIpfs } from 'utils';
import { Hex } from 'viem';

import { useCallModuleFunction } from './use-call-module-function';

interface ContractInteractionProps {
  moduleParameters: ModuleParameter[] | undefined;
  moduleDetails?: ModuleDetails | undefined; // required when signing agreement
  chainId?: SupportedChains | undefined; // required when signing agreement
  controllerAddress?: string | undefined;
  onSuccessfulSign?: () => void;
  mchAddress?: Hex | undefined;
  onDecline?: () => void;
}

const useAgreementClaim = ({
  moduleParameters,
  moduleDetails,
  chainId,
  onSuccessfulSign,
  mchAddress,
  onDecline,
}: ContractInteractionProps) => {
  const ipfsHash = get(find(moduleParameters, { label: 'Current Agreement' }), 'value') as string;

  const {
    data: agreement,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['agreement', ipfsHash],
    queryFn: () => fetchIpfs(ipfsHash).then((res) => get(res, 'data', null)),
    enabled: !!ipfsHash,
  });

  const signAndClaim = find(get(moduleDetails, 'writeFunctions'), {
    functionName: 'signAgreementAndClaimHat',
  });

  const signFn = find(get(moduleDetails, 'writeFunctions'), {
    functionName: 'signAgreement',
  });

  const { mutate: callModuleFunction } = useCallModuleFunction({
    chainId,
  });

  const handleSignAndClaim = async () => {
    callModuleFunction({
      moduleId: moduleDetails?.implementationAddress,
      instance: moduleDetails?.instanceAddress as Hex,
      func: signAndClaim as ModuleFunction,
      args: {
        'Claims Hatter': mchAddress,
      },
      onSuccess: onSuccessfulSign,
      onDecline,
    });
  };

  const handleSign = async () => {
    // TODO better catch for errors? (added toast/logging in useCallModuleFunction)
    callModuleFunction({
      moduleId: moduleDetails?.implementationAddress,
      instance: moduleDetails?.instanceAddress as Hex,
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

export { useAgreementClaim };
