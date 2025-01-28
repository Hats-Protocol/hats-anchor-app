'use client';

import { useHatDetails } from 'hats-hooks';
import { useCouncilDetails, useOffchainCouncilDetails } from 'hooks';
import { get } from 'lodash';
import { useParams, usePathname } from 'next/navigation';
import { SupportedChains } from 'types';
import { Link } from 'ui';
import { logger, parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

import { Login } from './login';

const Navbar = () => {
  const pathname = usePathname();
  const { slug } = useParams<{ slug: string }>();
  const { chainId, address } = parseCouncilSlug(slug);
  const isJoinLink = pathname.includes('join');

  const { data: councilDetails } = useCouncilDetails({
    chainId: chainId as SupportedChains,
    address,
  });
  const { data: offchainDetails } = useOffchainCouncilDetails({
    chainId: chainId as SupportedChains,
    hsg: address as Hex,
  });
  const { details } = useHatDetails({
    chainId: chainId as SupportedChains,
    hatId: get(councilDetails, 'signerHats[0].id'),
  });
  // logger.debug('nav', { offchainDetails, details });

  return (
    <div className='flex min-h-[56px] w-full items-center justify-between px-2'>
      <div className='flex items-center gap-4'>
        <Link href='/'>
          <img src='/hats.png' className='h-10 w-10' alt='Hats Logo' />
        </Link>

        <p className='text-lg font-bold'>{offchainDetails?.creationForm.organizationName}</p>
      </div>

      <Login />
    </div>
  );
};

export { Navbar };
