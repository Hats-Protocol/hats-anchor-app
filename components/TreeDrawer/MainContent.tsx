import { Box, Button, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { BsChevronRight } from 'react-icons/bs';

import { generateLocalStorageKey } from '@/lib/general';
import { idToPrettyId, prettyIdToIp } from '@/lib/hats';
import { FormData, IHat } from '@/types';

const MainContent = ({
  tree,
  handleHatClick,
  storedDataString,
}: MainContentProps) => {
  const { events } = tree[0];

  function getProposedChangesCount(hatId: string): number {
    if (!storedDataString) {
      return 0;
    }

    try {
      const storedHats = JSON.parse(storedDataString);
      const matchingHat = storedHats.find((hat: FormData) => hat.id === hatId);

      if (
        matchingHat &&
        typeof matchingHat === 'object' &&
        matchingHat !== null
      ) {
        // Subtracting 1 from the count to exclude the "id" key itself
        return Object.keys(matchingHat).length - 1;
      }
    } catch (err) {
      console.error('Failed to parse stored values from localStorage.', err);
    }

    return 0;
  }

  return (
    <Stack
      p={10}
      pt={8}
      spacing={10}
      w='100%'
      overflow='scroll'
      height='calc(100% - 75px)'
      top={75}
      pos='relative'
    >
      <Stack>
        <Heading color='blackAlpha.800' fontSize={24} fontWeight='medium'>
          {tree[0]?.detailsObject?.data?.name || tree[0]?.name || 'No Hats'}
        </Heading>
        <Text color='blackAlpha.700'>
          {tree[0]?.detailsObject?.data?.description || 'No Description'}
        </Text>
        <Text color='blackAlpha.600'>
          Created{' '}
          {events?.[events.length - 1]?.timestamp &&
            formatDistanceToNow(
              new Date(Number(events[0]?.timestamp) * 1000),
            )}{' '}
          ago. Last edited{' '}
          {/* maybe we're looking for the last change in the tree, not the top hat? */}
          {events?.[events.length - 1]?.timestamp &&
            formatDistanceToNow(
              new Date(Number(events[events.length - 1]?.timestamp) * 1000),
            )}{' '}
          ago.
        </Text>
      </Stack>
      <Stack>
        <Text color='blackAlpha.800' fontSize='xl' fontWeight='medium'>
          Drafted Changes
        </Text>
        <Text>
          Propose changes to any hat. Deploy changes to the Hats you control.
        </Text>
      </Stack>
      <Box>
        {tree.map((hat) => (
          <Box
            borderBottom='1px solid'
            borderColor='gray.300'
            w='full'
            key={hat.id}
          >
            <Button
              w='full'
              justifyContent='space-between'
              h={10}
              alignItems='center'
              variant='ghost'
              borderRadius={0}
              isDisabled={!hat.mutable}
              onClick={() => handleHatClick(hat.id)}
            >
              {prettyIdToIp(idToPrettyId(hat.id))}{' '}
              {hat?.detailsObject?.data?.name || hat.name}
              <HStack>
                {getProposedChangesCount(hat.id) && (
                  <Text
                    borderColor='cyan.600'
                    borderWidth={1}
                    borderRadius={2}
                    px={1}
                    color='cyan.600'
                    fontSize='sm'
                  >
                    {getProposedChangesCount(hat.id)} CHANGE
                    {getProposedChangesCount(hat.id) > 1 ? 'S' : ''}
                  </Text>
                )}
                {!hat.mutable && (
                  <Text
                    borderColor='gray.600'
                    borderWidth={1}
                    borderRadius={2}
                    px={1}
                    color='gray.600'
                    fontSize='sm'
                  >
                    IMMUTABLE
                  </Text>
                )}

                <BsChevronRight />
              </HStack>
            </Button>
          </Box>
        ))}
      </Box>
    </Stack>
  );
};

export default MainContent;

interface MainContentProps {
  tree: IHat[];
  handleHatClick: (hatId: string) => void;
  storedDataString: string;
}
