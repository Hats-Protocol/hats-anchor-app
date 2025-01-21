import { toLower } from 'lodash';
import { createIcon } from 'opepen-standard';
import { useMemo } from 'react';
import { CouncilMember } from 'types';
import { formatAddress } from 'utils';
import { useEnsAvatar, useEnsName } from 'wagmi';

import OblongAvatar from './OblongAvatar';

const MemberAvatar = ({ member, stack = false }: { member: CouncilMember; stack?: boolean }) => {
  console.log(member);
  const { name, address, id } = member;
  const { data: ensName } = useEnsName({
    address: (address || id) as `0x${string}`,
    chainId: 1,
  });
  const { data: avatar } = useEnsAvatar({
    name: ensName || '',
    chainId: 1,
  });
  const fallbackAvatar = useMemo(() => {
    if (!address && !id) return undefined;
    return createIcon({
      seed: toLower(address || id),
      size: 64,
    }).toDataURL();
  }, [address, id]);

  if (stack) {
    return (
      <div className='flex items-center gap-2'>
        <OblongAvatar src={avatar || fallbackAvatar} height={40} />

        <div className='flex flex-col gap-1'>
          <span className='text-sm font-medium text-gray-900'>{name || ensName}</span>
          <span className='text-sm text-gray-600'>
            {name ? ensName || formatAddress(address || id) : formatAddress(address || id)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-2'>
      <OblongAvatar src={avatar || fallbackAvatar} height={16} />
      {name && <span className='text-sm font-medium text-gray-900'>{name}</span>}
      <span className='text-sm text-gray-600'>{ensName || formatAddress(address || id)}</span>
    </div>
  );
};

export { MemberAvatar };
