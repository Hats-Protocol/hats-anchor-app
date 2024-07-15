'use client';

import {
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { Modal, useOverlay } from 'contexts';
import { useMediaStyles } from 'hooks';
import _, { toLower } from 'lodash';
import { createIcon } from 'opepen-standard';
import posthog from 'posthog-js';
import { useEffect, useMemo } from 'react';
import { formatAddress } from 'utils';
import { useAccount, useChainId, useEnsAvatar, useEnsName } from 'wagmi';

import WalletProfile from './WalletProfile';

const ConnectWallet = () => {
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
      seed: _.toLower(address),
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
        {({
          account,
          chain,
          openChainModal,
          openConnectModal,
          mounted,
          authenticationStatus,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === 'authenticated');

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
            return <Skeleton w='200px' h='40px' borderRadius='md' />;
          }

          return (() => {
            if (!connected) {
              return (
                <Button onClick={trackedOpenConnectModal} variant='whiteFilled'>
                  Connect Wallet
                </Button>
              );
            }

            if (chain.unsupported) {
              return (
                <Button
                  onClick={trackedOpenChainModal}
                  type='button'
                  variant='whiteFilled'
                >
                  Wrong network
                </Button>
              );
            }

            return (
              <Flex gap={2}>
                <Button
                  onClick={openChainModal}
                  display='flex'
                  alignItems='center'
                  px={2}
                  variant='whiteFilled'
                >
                  {chain.hasIcon && chain.iconUrl && (
                    <Image
                      alt={chain.name ?? 'Chain icon'}
                      src={chain.iconUrl}
                      borderRadius='50%'
                      width={25}
                      height={25}
                    />
                  )}
                </Button>

                <Button
                  variant='whiteFilled'
                  onClick={openAccountModal}
                  px={{ base: 2, md: 4 }}
                >
                  <HStack spacing={2} align='center'>
                    {ensAvatar || fallbackAvatar ? (
                      <Box
                        height='26px'
                        width='16px'
                        overflow='hidden'
                        backgroundImage={ensAvatar || fallbackAvatar}
                        backgroundSize='cover'
                        backgroundClip='content-box'
                        backgroundPosition='center'
                        borderRadius='sm'
                      />
                    ) : (
                      <Box
                        height='14px'
                        width='14px'
                        borderRadius='50%'
                        bg='green.700'
                      />
                    )}

                    {!isMobile && (
                      <Text variant='medium' noOfLines={1}>
                        {ensName || account.displayName}
                      </Text>
                    )}
                  </HStack>
                </Button>
              </Flex>
            );
          })();
        }}
      </RainbowConnectButton.Custom>

      <Modal name='account' onClose={() => setModals?.({})} size='md'>
        {address && (
          <WalletProfile
            address={address}
            name={ensName || formatAddress(address)}
            avatar={ensAvatar || fallbackAvatar}
          />
        )}
      </Modal>
    </>
  );
};

export default ConnectWallet;
