import { Box, Button, Flex, HStack, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useChainId } from 'wagmi';

import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import useHatBurn from '@/hooks/useHatBurn';
import { decimalId } from '@/lib/hats';
import { IHat } from '@/types';

// TODO is this used?
const HatRenounceForm = ({ hatData }: { hatData: IHat }) => {
  const { closeModals } = useOverlay();
  const chainId = useChainId();
  const { writeAsync: renounceHat } = useHatBurn({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId: decimalId(_.get(hatData, 'id')),
    wearers: _.get(hatData, 'wearers'),
  });

  const handleRenounceHat = async () => {
    await renounceHat?.();
  };

  return (
    <Stack>
      <Text>
        You are about to renounce (burn) your Hat with the following Hat ID:
      </Text>
      <Box bg='blackAlpha.200' p={4} borderRadius='md'>
        <Text fontFamily='monospace' fontSize='md'>
          {_.get(hatData, 'prettyId')}
        </Text>
      </Box>
      <Text>Are you sure you want to do this?</Text>
      <Flex justify='flex-end' w='100%'>
        <HStack>
          <Button onClick={closeModals} variant='outline'>
            Cancel
          </Button>
          <Button
            onClick={handleRenounceHat}
            isDisabled={renounceHat === undefined}
          >
            Yes I&apos;m sure - Renounce
          </Button>
        </HStack>
      </Flex>
    </Stack>
  );
};

export default HatRenounceForm;
