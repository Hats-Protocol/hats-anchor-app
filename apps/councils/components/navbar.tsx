'use client';

import { useCouncilDetails, useOffchainCouncilDetails, useOrganization } from 'hooks';
import { capitalize, keys, map } from 'lodash';
import { useParams, usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { useEffect, useState } from 'react';
import { SupportedChains } from 'types';
import { cn, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Link } from 'ui';
import { parseCouncilSlug } from 'utils';
import { getAddress, Hex } from 'viem';

import { Login } from './login';

const DEV_PAGES = {
  mails: '/buidl/mails',
  compliance: '/buidl/compliance',
  payments: '/buidl/payments',
};

const Navbar = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const pathname = usePathname();
  const params = useParams<{ slug?: string; organizationName?: string }>();
  const { slug } = params;
  const { chainId, address } = parseCouncilSlug(slug ?? '');
  const createForm = pathname.includes('councils/new');
  const isOrganizationRoute = pathname.includes('/organizations/');

  const { data: councilDetails } = useCouncilDetails({
    chainId: chainId as SupportedChains,
    address,
  });
  const { data: offchainDetails } = useOffchainCouncilDetails({
    hsg: councilDetails?.id ? (getAddress(councilDetails?.id) as Hex) : undefined,
    chainId: chainId ?? 11155111,
    enabled: !!councilDetails?.id && !!chainId,
  });

  const { data: organization } = useOrganization(isOrganizationRoute ? params.organizationName : undefined);

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  return (
    <div
      className={cn(
        'flex min-h-[60px] w-full items-center justify-between bg-gray-50 px-6',
        (createForm || (!chainId && !address)) && 'bg-gray-100',
        chainId && address && 'bg-gray-200',
      )}
    >
      <div className='flex items-center gap-4'>
        <Link href='/' className='text-foreground/80 hover:text-foreground flex items-center gap-4'>
          <img src='/hats.png' className='size-10' alt='Hats Logo' />

          {!chainId && !address && !createForm && !isOrganizationRoute && (
            <p className='text-xl font-semibold text-black hover:text-black/80'>
              hats <span className='font-normal'>pro</span>
            </p>
          )}
        </Link>

        {chainId && address && (
          <p className='text-lg font-bold'>
            {typeof offchainDetails?.creationForm.organizationName === 'object'
              ? offchainDetails?.creationForm.organizationName?.value
              : offchainDetails?.creationForm.organizationName}
          </p>
        )}
        {createForm && <p className='text-lg font-bold'>New Hats Council</p>}
        {isOrganizationRoute && organization && <p className='text-lg font-bold'>{organization.name}</p>}

        {isDev && isClient && (
          <DropdownMenu>
            <DropdownMenuTrigger className='text-sm'>Dev</DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              {map(keys(DEV_PAGES), (page) => (
                <Link href={DEV_PAGES[page as keyof typeof DEV_PAGES]} className='text-foreground/80' key={page}>
                  <DropdownMenuItem>{capitalize(page)}</DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Login />
    </div>
  );
};

export { Navbar };
