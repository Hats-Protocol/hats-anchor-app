'use client';

import { CONFIG } from '@hatsprotocol/config';
import { useEligibility } from 'contexts';
import { HatIcon } from 'icons';
import { get } from 'lodash';
import { useModuleDetails } from 'modules-hooks';
import { BsFileCode } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa';
import { HatWearer } from 'types';
import { cn } from 'ui';
import { formatAddress, isSameAddress } from 'utils';
import { useAccount } from 'wagmi';

const WearerRow = ({ wearer }: WearerRowProps) => {
  const { address } = useAccount();
  const { chainId } = useEligibility();

  const { details: moduleDetails } = useModuleDetails({
    address: wearer.id,
    chainId,
    enabled: wearer.isContract,
  });

  let icon = <FaUser className='text-gray-500' />;
  if (isSameAddress(wearer.id, address)) {
    icon = <HatIcon className='text-gray-500' />;
  } else if (wearer.isContract) {
    icon = <BsFileCode className='text-gray-500' />;
  }

  // could look up by Id to be more resilient?
  let moduleName = get(moduleDetails, 'name');
  const moduleImplementation = get(moduleDetails, 'implementationAddress');
  if (
    moduleImplementation === CONFIG.modules.claimsHatterV1 ||
    moduleImplementation === CONFIG.modules.claimsHatterV2
  ) {
    moduleName = 'Autonomous Admin';
  }

  return (
    <div className='flex w-full items-center justify-between'>
      <div className={cn('flex items-center gap-2', isSameAddress(wearer.id, address) && 'bg-green-100')}>
        {icon}

        <p>{get(wearer, 'ensName') || moduleName || formatAddress(get(wearer, 'id'))}</p>
      </div>
    </div>
  );
};

interface WearerRowProps {
  wearer: HatWearer;
}

export { WearerRow };
