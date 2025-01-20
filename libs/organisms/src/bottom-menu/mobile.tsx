'use client';

import { Box, Button, Flex, Icon, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { useClipboard } from 'hooks';
import { includes, map } from 'lodash';
import { useHatClaimBy } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { FaCopy, FaEllipsisV } from 'react-icons/fa';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const MobileBottomMenu = ({ show = false }: { show: boolean | undefined }) => {
  const { handlePendingTx } = useOverlay();
  const currentNetworkId = useChainId();
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { onCopy: copyHatId } = useClipboard(selectedHat?.id || '', {
    toastData: { title: 'Successfully copied hat ID to clipboard' },
  });
  const { onCopy: copyContractAddress } = useClipboard(HATS_V1, {
    toastData: { title: 'Successfully copied contract address to clipboard' },
  });
  const { address } = useAccount();

  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaimBy({
    selectedHat,
    chainId,
    wearer: address as Hex,
    handlePendingTx,
  });

  const { data: wearer } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });
  const isWearing = includes(map(wearer, 'id'), selectedHat?.id);

  return (
    <Box w='100%' position='fixed' bottom={0} zIndex={14} bg='whiteAlpha.900' display={show ? 'block' : 'none'}>
      <Flex
        justify={isClaimable && !isWearing && hatterIsAdmin ? 'space-between' : 'end'}
        p={2}
        borderTop='1px solid'
        borderColor='gray.200'
      >
        {!!isClaimable && !isWearing && !!hatterIsAdmin && (
          <Button
            variant='outlineMatch'
            colorScheme='blue.500'
            isDisabled={!claimHat || !hatterIsAdmin || chainId !== currentNetworkId}
            onClick={claimHat}
            leftIcon={<Icon as={HatIcon} color='white' />}
          >
            Claim Hat
          </Button>
        )}

        <Flex>
          <Menu>
            <MenuButton as={Button} leftIcon={<FaEllipsisV />} variant='outline'>
              More
            </MenuButton>
            <MenuList>
              <MenuItem gap={2} onClick={copyHatId}>
                <FaCopy />
                Copy hat ID
              </MenuItem>
              <MenuItem gap={2} onClick={copyContractAddress}>
                <FaCopy />
                Copy contract ID
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
};

export { MobileBottomMenu };
