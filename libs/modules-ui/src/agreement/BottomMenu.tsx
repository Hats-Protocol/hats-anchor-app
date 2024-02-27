import { Box, Button, Flex, Icon } from '@chakra-ui/react';
import { useEligibility } from 'contexts';
import { useHatClaimBy, useWearerDetails } from 'hats-hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useAccount, useChainId } from 'wagmi';

const HatIcon = dynamic(() => import('ui').then((mod) => mod.HatIcon));

const BottomMenu = () => {
  const currentNetworkId = useChainId();
  const { selectedHat, chainId } = useEligibility();
  const { address } = useAccount();

  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaimBy({
    selectedHat,
    chainId,
    wearer: address,
  });
  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const isWearing = _.includes(_.map(wearer, 'id'), selectedHat?.id);

  return (
    isClaimable &&
    !isWearing && (
      <Box w='100%' position='fixed' bottom={0} zIndex={14} bg='whiteAlpha.900'>
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
        </Flex>
      </Box>
    )
  );
};

export default BottomMenu;
