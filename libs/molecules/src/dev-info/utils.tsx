'use client';

import { useClipboard } from 'hooks';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from 'ui';
import { explorerUrl, formatAddress, hatLink } from 'utils';
import { Hex } from 'viem';

const CopyAddress = dynamic(() => import('icons').then((mod) => mod.CopyAddress));

export const DefaultInfo = ({ children }: { children: string }) => <div className='text-sm'>{children}</div>;

export const LinkInfo = ({ link, children }: { link: string; children: string }) => (
  <Link className='text-sm' href={link}>
    {children}
  </Link>
);

export const HatInfo = ({
  hatId,
  chainId,
  children,
}: {
  hatId: Hex;
  chainId: number | undefined;
  children: string;
}) => {
  if (!chainId) return null;

  return (
    <Link className='text-sm' href={hatLink({ chainId, hatId })}>
      {children}
    </Link>
  );
};

export const AddressInfo = ({ address, chainId }: { address: string; chainId: number | undefined }) => {
  const { onCopy: copyAddress } = useClipboard(address, {
    toastData: { title: 'Copied address' },
  });
  if (!chainId || !address) return null;
  return (
    <div className='flex gap-2'>
      <Link className='text-sm' href={`${explorerUrl(chainId)}/address/${address}`}>
        {formatAddress(address)}
      </Link>

      <Button variant='link' onClick={copyAddress} className='min-w-5' aria-label='Copy address'>
        <CopyAddress />
      </Button>
    </div>
  );
};
