'use client';

import { pick, toLower } from 'lodash';
import { createIcon } from 'opepen-standard';
import { useEffect, useMemo, useRef, useState } from 'react';
// import { CouncilMember, HatWearer } from 'types';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useEnsAvatar, useEnsName } from 'wagmi';

import { OblongAvatar } from '../oblong-avatar';

// type Member = CouncilMember & HatWearer; // TODO this type?

const MemberAvatar = ({
  member,
  stack = false,
  showDetails = true,
  className,
}: {
  member: any;
  stack?: boolean;
  showDetails?: boolean;
  className?: string;
}) => {
  const { name, address, id } = pick(member, ['name', 'address', 'id']);
  const localAddress = toLower(address || id) as Hex;

  // Lazy load ENS data only when component is visible in viewport
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { data: ensName } = useEnsName({
    address: localAddress,
    chainId: 1,
    query: { enabled: isVisible && !!localAddress },
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName || undefined,
    chainId: 1,
    query: { enabled: isVisible && !!ensName },
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
      <div ref={ref} className='flex items-center gap-2'>
        <OblongAvatar src={ensAvatar || fallbackAvatar} className='h-10 w-8' />
        {showDetails && (
          <div className='flex flex-col gap-0.5'>
            {(name || ensName) && <span className='text-sm font-medium text-gray-900'>{name || ensName}</span>}
            <span className='font-jb-mono text-sm text-gray-600'>
              {!!name && name !== '' ? ensName || formatAddress(localAddress) : formatAddress(localAddress)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className='flex items-center gap-2'>
      <OblongAvatar src={ensAvatar || fallbackAvatar} className={className || 'h-5 w-4 rounded-sm'} />
      {showDetails && (
        <>
          {(name || ensName) && <span className='text-sm font-medium text-gray-900'>{name || ensName}</span>}
          <span className='font-jb-mono text-sm text-gray-600'>
            {!!name && name !== '' ? ensName || formatAddress(localAddress) : formatAddress(localAddress)}
          </span>
        </>
      )}
    </div>
  );
};

export { MemberAvatar };
