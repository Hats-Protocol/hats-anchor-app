import { Button, HStack, Flex, Stack, Text, Box } from '@chakra-ui/react';
import { useOverlay } from '../contexts/OverlayContext';
import useHatBurn from '../hooks/useHatBurn';
import { useChainId } from 'wagmi';
import { hatsAddresses } from '../constants';
import { decimalId } from '../lib/hats';

const HatRenounceForm = ({ hatData }) => {
  const { setModals } = useOverlay;
  const chainId = useChainId();
  const { writeAsync: renounceHat } = useHatBurn({
    hatsAddress: hatsAddresses(chainId),
    chainId,
    hatId: decimalId(_.get(hatData, 'id')),
  });

  const handleRenounceHat = async () => {
    await renounceHat();
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
          <Button
            onClick={() => setModals({ renounceConfirm: false })}
            variant='outline'
          >
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
