'use client';

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { Modal, useOverlay } from 'contexts';
import { useMediaStyles } from 'hooks';
import { toLower } from 'lodash';
import { createIcon } from 'opepen-standard';
import posthog from 'posthog-js';
import { useEffect, useMemo } from 'react';
import { Button, OblongAvatar, Skeleton } from 'ui';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId, useEnsAvatar, useEnsName } from 'wagmi';

import { WalletProfile } from './wallet-profile';

const ConnectWallet = ({ hideProfileButton = false }: ConnectWalletProps) => {
  const { address } = useAccount();
  const { setModals } = useOverlay();
  const chainId = useChainId();
  const { isMobile } = useMediaStyles();
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName as string,
    chainId: 1,
  });

  const fallbackAvatar = useMemo(() => {
    if (!address) return undefined;
    return createIcon({
      seed: toLower(address),
      size: 64,
    }).toDataURL();
  }, [address]);

  const openAccountModal = () => {
    posthog.capture('Opened Account Modal', { chain_id: chainId });
    setModals?.({ account: true });
  };

  useEffect(() => {
    if (!address || !chainId) return;

    posthog.identify(toLower(address), {
      alias: ensName,
      // check community hat wearer
      // check is HL team member
    });
  }, [address, ensName, chainId]);

  return (
    <>
      <RainbowConnectButton.Custom>
        {({ account, chain, openChainModal, openConnectModal, mounted }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          const trackedOpenConnectModal = () => {
            posthog.capture('Opened Wallet Modal', {
              is_connected: false,
            });
            openConnectModal();
          };

          const trackedOpenChainModal = () => {
            posthog.capture('Opened Chain Modal', {
              is_connected: connected,
              chain_id: chain?.id,
            });
            openChainModal();
          };

          if (!ready) {
            return <Skeleton className='h-10 w-[110px] rounded md:w-[200px]' />;
          }

          return (() => {
            if (!connected) {
              return (
                <Button onClick={trackedOpenConnectModal} variant='outline'>
                  Connect{!isMobile && ' Wallet'}
                </Button>
              );
            }

            if (chain.unsupported) {
              return (
                <Button variant='outline' onClick={trackedOpenChainModal} type='button'>
                  Wrong network
                </Button>
              );
            }

            return (
              <div className='z-0 flex gap-2'>
                <Button variant='outline' className='flex items-center px-2' onClick={openChainModal}>
                  {chain.hasIcon && chain.iconUrl && (
                    <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} className='h-6 w-6 rounded-full' />
                  )}
                </Button>

                <Button variant='outline' className='px-2 md:px-4' onClick={openAccountModal}>
                  <div className='flex items-center gap-2'>
                    {ensAvatar || fallbackAvatar ? (
                      <OblongAvatar className='h-6 w-5 rounded-sm' src={ensAvatar || fallbackAvatar} />
                    ) : null}

                    {!isMobile && <p className='line-clamp-1 font-medium'>{ensName || account.displayName}</p>}
                  </div>
                </Button>
              </div>
            );
          })();
        }}
      </RainbowConnectButton.Custom>

      {address && (
        <Modal name='account' onClose={() => setModals?.({})} size='md' direction='bottom'>
          <div className='py-10'>
            <WalletProfile
              address={address as Hex}
              name={ensName || formatAddress(address)}
              avatar={ensAvatar || fallbackAvatar}
              hideProfileButton={hideProfileButton}
            />
          </div>
        </Modal>
      )}
    </>
  );
};

interface ConnectWalletProps {
  hideProfileButton?: boolean;
}

export { ConnectWallet };
