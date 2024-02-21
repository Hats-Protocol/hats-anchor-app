import { Box, Button, Flex, HStack, Image, Text } from '@chakra-ui/react';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import blockies from 'blockies-ts';
import { Modal, useOverlay } from 'contexts';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { formatAddress } from 'utils';
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi';

import WalletProfile from './WalletProfile';

const ConnectWallet = () => {
  const [blockie, setBlockie] = useState<string | undefined>();
  const { address } = useAccount();
  const localOverlay = useOverlay();
  const { setModals, isMobile } = localOverlay;
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
                  <Button onClick={openConnectModal} variant='outline'>
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} type='button'>
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
                    bg='green.200'
                    onClick={openAccountModal}
                    _hover={{ bg: 'green.300' }}
                    color='green.700'
                    px={{ base: 2, md: 4 }}
                  >
                    <HStack spacing={2} align='center'>
                      {ensAvatar || blockie ? (
                        <Box
                          height={ensAvatar ? '28px' : '20px'}
                          width={ensAvatar ? '28px' : '20px'}
                          borderRadius='50%'
                          overflow='hidden'
                          borderColor='green.700'
                          borderWidth='3px'
                        >
                          <Image
                            src={ensAvatar || blockie}
                            alt='User Avatar'
                            height='25px'
                            width='25px'
                          />
                        </Box>
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
        localOverlay={localOverlay}
        onClose={() => setModals?.({})}
        size={{ base: 'full', md: 'md' }}
      >
        {address && (
          <WalletProfile
            address={address}
            name={ensName || formatAddress(address)}
            avatar={ensAvatar || blockie}
          />
        )}
      </Modal>
    </>
  );
};

export default ConnectWallet;
