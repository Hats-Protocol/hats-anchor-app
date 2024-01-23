import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useMediaQuery,
} from '@chakra-ui/react';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import blockies from 'blockies-ts';
import { useEffect, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';

const ConnectWallet = () => {
  const [blockie, setBlockie] = useState<string | undefined>();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address, chainId: 1 });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName,
    chainId: 1,
    cacheTime: 60,
  });

  const [upTo780] = useMediaQuery('(max-width: 780px)');

  useEffect(() => {
    if (address) {
      setBlockie(blockies.create({ seed: address.toLowerCase() }).toDataURL());
    }
  }, [address]);

  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
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

                <Menu placement='bottom-end' isLazy>
                  <MenuButton
                    as={Button}
                    rightIcon={<Icon as={FaChevronDown} />}
                    bg='green.200'
                    _hover={{ bg: 'green.300' }}
                    color='green.700'
                  >
                    <HStack spacing={2} align='center'>
                      {(ensAvatar || blockie) && !upTo780 ? (
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
                          height='28px'
                          width='28px'
                          borderRadius='50%'
                          bg='green.700'
                        />
                      )}

                      <Heading size='sm'>
                        {ensName || account.displayName}
                      </Heading>
                    </HStack>
                  </MenuButton>
                  <MenuList bg='green.100' color='green.700'>
                    <MenuItem
                      onClick={openAccountModal}
                      bg='green.100'
                      _hover={{ bg: 'green.300' }}
                      color='green.700'
                    >
                      Wallet
                    </MenuItem>
                    <MenuItem
                      onClick={() => disconnect()}
                      bg='green.100'
                      _hover={{ bg: 'green.300' }}
                      color='green.700'
                    >
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            );
          })()
        );
      }}
    </RainbowConnectButton.Custom>
  );
};

export default ConnectWallet;
