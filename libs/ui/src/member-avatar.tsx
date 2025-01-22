import { pick, toLower } from 'lodash';
import { createIcon } from 'opepen-standard';
import { useMemo } from 'react';
// import { CouncilMember, HatWearer } from 'types';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useEnsAvatar, useEnsName } from 'wagmi';

import OblongAvatar from './OblongAvatar';

// type Member = CouncilMember & HatWearer; // TODO this type?

const MemberAvatar = ({ member, stack = false }: { member: any; stack?: boolean }) => {
  const { name, address, id } = pick(member, ['name', 'address', 'id']);
  const localAddress = toLower(address || id) as Hex;

  const { data: ensName } = useEnsName({
    address: localAddress,
    chainId: 1,
  });
  const { data: avatar } = useEnsAvatar({
    name: ensName || '',
    chainId: 1,
  });
  const fallbackAvatar = useMemo(() => {
    if (!localAddress) return undefined;
    return createIcon({
      seed: localAddress,
      size: 64,
    }).toDataURL();
  }, [localAddress]);

  if (stack) {
    return (
      <div className='flex items-center gap-2'>
        <OblongAvatar src={avatar || fallbackAvatar} height={40} />

        <div className='flex flex-col gap-1'>
          {(name || ensName) && <span className='text-sm font-medium text-gray-900'>{name || ensName}</span>}
          <span className='font-jbMono text-sm text-gray-600'>
            {!!name && name !== '' ? ensName || formatAddress(localAddress) : formatAddress(localAddress)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-2'>
      <OblongAvatar src={avatar || fallbackAvatar} height={16} />
      {(name || ensName) && <span className='text-sm font-medium text-gray-900'>{name || ensName}</span>}
      <span className='font-jbMono text-sm text-gray-600'>
        {!!name && name !== '' ? ensName || formatAddress(localAddress) : formatAddress(localAddress)}
      </span>
    </div>
  );
};

export { MemberAvatar };
