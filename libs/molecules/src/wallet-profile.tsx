'use client';

import { NETWORK_IMAGES } from '@hatsprotocol/config';
import { useChainModal } from '@rainbow-me/rainbowkit';
import { useOverlay } from 'contexts';
import { useClipboard } from 'hooks';
import { each, isEmpty, size } from 'lodash';
import dynamic from 'next/dynamic';
import { BsBoxArrowRight } from 'react-icons/bs';
import { FaCaretRight } from 'react-icons/fa';
import { SupportedChains } from 'types';
import { Button, Link, OblongAvatar } from 'ui';
import { chainsMap, formatAddress, formatRoundedDecimals } from 'utils';
import { Hex } from 'viem';
import { useBalance, useChainId, useDisconnect } from 'wagmi';

import { TransactionHistory } from './transaction-history';

const CopyAddress = dynamic(() => import('icons').then((i) => i.CopyAddress));
const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));

const WAGMI_STORAGE_KEYS = [
  'wagmi.injected.connected',
  'wagmi.injected.disconnected',
  'wagmi.recentConnectorId',
  'wagmi.store',
];

const WalletProfile = ({
  address,
  name,
  avatar,
  hideProfileButton = false,
}: {
  address: Hex;
  name: string;
  avatar: string | undefined;
  hideProfileButton?: boolean;
}) => {
  const chainId = useChainId();
  const { transactions, setModals } = useOverlay();
  const { data: balance } = useBalance({ address, chainId });
  const { openChainModal } = useChainModal();
  const { disconnect } = useDisconnect();

  const { onCopy } = useClipboard(address, {
    toastData: { title: 'Address copied' },
  });

  const toggleNetworkModal = () => {
    setModals?.({});
    openChainModal?.();
  };

  const toggleTransactionHistoryModal = () => {
    setModals?.({ transactions: true });
  };

  const handleDisconnect = () => {
    setModals?.({});
    disconnect();
    each(WAGMI_STORAGE_KEYS, (key) => {
      localStorage.removeItem(key);
    });
    // don't reload as it'll attempt to re-connect
    // window.location.reload();
  };

  return (
    <div className='flex flex-col'>
      <div className='flex items-center gap-6'>
        {avatar && <OblongAvatar src={avatar} />}
        <div className='flex flex-col'>
          <h3 className='text-xl'>{name}</h3>
          <div className='flex items-center gap-4'>
            <p>
              {formatRoundedDecimals({
                value: balance?.value,
                decimals: balance?.decimals || 18,
                rounded: 2,
              })}{' '}
              {balance?.symbol}
            </p>

            <Button variant='link' className='text-blue-500' onClick={onCopy}>
              {formatAddress(address)}
              <CopyAddress className='ml-1 h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
      <div className='mb-2 flex justify-between gap-2'>
        <Button className='w-full' variant='outline' onClick={toggleNetworkModal}>
          <div className='flex items-center gap-2'>
            <img src={NETWORK_IMAGES[chainId as SupportedChains]} className='h-5 w-5' />
            <p>{chainsMap(chainId)?.name}</p>
          </div>
        </Button>

        {!hideProfileButton && (
          <Link href={`/wearers/${address}`} onClick={() => setModals?.({})} className='w-full'>
            <Button className='w-full' variant='outline'>
              <div className='flex items-center gap-2'>
                <WearerIcon className='h-4 w-4' />
                <p>Profile</p>
              </div>
            </Button>
          </Link>
        )}
      </div>

      {!isEmpty(transactions) && (
        <div>
          <h3 className='text-md'>Transaction History</h3>
          <TransactionHistory count={2} transactions={transactions || []} hideHash />
          {size(transactions) > 2 && (
            <div className='flex'>
              <Button variant='ghost' size='sm' onClick={toggleTransactionHistoryModal}>
                Show full History
                <FaCaretRight className='ml-1 h-4 w-4' />
              </Button>
            </div>
          )}
        </div>
      )}

      <div className='flex'>
        <Button variant='destructive' onClick={handleDisconnect} className='w-full'>
          Sign Out
          <BsBoxArrowRight className='ml-1 h-4 w-4' />
        </Button>
      </div>
    </div>
  );
};

export { WalletProfile };
