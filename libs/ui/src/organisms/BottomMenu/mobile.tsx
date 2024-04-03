import {
  Box,
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useClipboard,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useHatClaimBy, useWearerDetails } from 'hats-hooks';
import { useToast } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { FaCopy, FaEllipsisV } from 'react-icons/fa';
import { useAccount, useChainId } from 'wagmi';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const BottomMenu = ({ show = false }: { show: boolean | undefined }) => {
  const { handlePendingTx } = useOverlay();
  const currentNetworkId = useChainId();
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { onCopy: copyHatId } = useClipboard(selectedHat?.id || '');
  const { onCopy: copyContractAddress } = useClipboard(CONFIG.hatsAddress);
  const toast = useToast();
  const { address } = useAccount();

  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaimBy({
    selectedHat,
    chainId,
    wearer: address,
    handlePendingTx,
  });

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const isWearing = _.includes(_.map(wearer, 'id'), selectedHat?.id);

  return (
    <Box
      w='100%'
      position='fixed'
      bottom={0}
      zIndex={14}
      bg='whiteAlpha.900'
      display={show ? 'block' : 'none'}
    >
      <Flex
        justify={
          isClaimable && !isWearing && hatterIsAdmin ? 'space-between' : 'end'
        }
        p={2}
        borderTop='1px solid'
        borderColor='gray.200'
      >
        {isClaimable && !isWearing && hatterIsAdmin && (
          <Button
            variant='outlineMatch'
            colorScheme='blue.500'
            isDisabled={
              !claimHat || !hatterIsAdmin || chainId !== currentNetworkId
            }
            onClick={claimHat}
            leftIcon={<Icon as={HatIcon} color='white' />}
          >
            Claim Hat
          </Button>
        )}

        <Flex pr={20}>
          <Menu>
            <MenuButton
              as={Button}
              leftIcon={<FaEllipsisV />}
              variant='outline'
            >
              More
            </MenuButton>
            <MenuList>
              <MenuItem
                gap={2}
                onClick={() => {
                  copyHatId();
                  toast.info({
                    title: 'Successfully copied hat ID to clipboard',
                  });
                }}
              >
                <FaCopy />
                Copy hat ID
              </MenuItem>
              <MenuItem
                gap={2}
                onClick={() => {
                  copyContractAddress();
                  toast.info({
                    title: 'Successfully copied contract address to clipboard',
                  });
                }}
              >
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

export default BottomMenu;
