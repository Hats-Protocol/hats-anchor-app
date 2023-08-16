import { Box, Stack, Text, Heading, HStack, Button } from '@chakra-ui/react';
import { IHat } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { generateLocalStorageKey } from '@/lib/general';
import { prettyIdToIp, idToPrettyId } from '@/lib/hats';
import _ from 'lodash';
import { BsChevronRight } from 'react-icons/bs';

const MainContent = ({ tree, handleHatClick }: MainContentProps) => {
  const { events } = tree[0];

  function getProposedChangesCount(hatId: string, chainId: number) {
    const localStorageKey = generateLocalStorageKey(hatId, chainId);
    const storedData = localStorage.getItem(localStorageKey);
    if (!storedData) {
      return 0;
    }
    const parsedData = JSON.parse(storedData);
    return Object.keys(parsedData).length;
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
              variant={'ghost'}
              borderRadius={0}
              isDisabled={!hat.mutable}
              onClick={() => handleHatClick(hat.id)}
            >
              {prettyIdToIp(idToPrettyId(hat.id))}{' '}
              {hat?.detailsObject?.data?.name || hat.name}
              <HStack>
                {getProposedChangesCount(hat.id, hat.chainId) && (
                  <Text
                    borderColor='cyan.600'
                    borderWidth={1}
                    borderRadius={2}
                    px={1}
                    color='cyan.600'
                    fontSize='sm'
                  >
                    {getProposedChangesCount(hat.id, hat.chainId)} CHANGES
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
}
