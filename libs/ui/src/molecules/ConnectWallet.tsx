import { Box, Button, Flex, HStack, Image, Text } from '@chakra-ui/react';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import blockies from 'blockies-ts';
import { Modal } from 'contexts';
import { OverlayContextProps, StandaloneOverlayContextProps } from 'hats-types';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { formatAddress } from 'utils';
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi';

import WalletProfile from './WalletProfile';

const ConnectWallet = ({ overlay }: ConnectWalletProps) => {
  const [blockie, setBlockie] = useState<string | undefined>();
  const { address } = useAccount();
  const { setModals } = _.pick(overlay, ['setModals']);
  const { isMobile } = useMediaStyles();
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName,
    chainId: 1,
    cacheTime: 60,
  });

  useEffect(() => {
    if (address) {
      setBlockie(blockies.create({ seed: _.toLower(address) }).toDataURL());
    }
  }, [address]);

  const openAccountModal = () => {
    setModals?.({ account: true });
  };

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

          return !ready ? (
            <Box
              display='none'
              opacity={0}
              pointerEvents='none'
              userSelect='none'
            />
          ) : (
            (() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} variant='whiteFilled'>
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
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
                      {ensAvatar || blockie ? (
                        <Box
                          height='26px'
                          width='16px'
                          overflow='hidden'
                          backgroundImage={ensAvatar || blockie}
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
            })()
          );
        }}
      </RainbowConnectButton.Custom>
      <Modal
        name='account'
        localOverlay={overlay}
        onClose={() => setModals?.({})}
        size='md'
      >
        {address && (
          <WalletProfile
            address={address}
            name={ensName || formatAddress(address)}
            avatar={ensAvatar || blockie}
            localOverlay={overlay}
          />
        )}
      </Modal>
    </>
  );
};

export default ConnectWallet;

interface ConnectWalletProps {
  overlay: StandaloneOverlayContextProps | OverlayContextProps;
}
