import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Stack,
  Text,
} from '@chakra-ui/react';
import { IHat } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const MainContent = ({ tree }: MainContentProps) => {
  const { events } = tree[0];

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
        <Text>
          {tree[0]?.detailsObject?.data?.name || tree[0]?.name || 'No Hats'}
        </Text>
        <Text>
          {tree[0]?.detailsObject?.data?.description || 'No Description'}
        </Text>
        <Text>
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
        <Text>Drafted Changes</Text>
        <Text>
          Propose changes to any hat. Deploy changes to the Hats you control.
        </Text>
      </Stack>
      <Accordion allowMultiple>
        {tree.map((hat) => (
          <AccordionItem key={hat.id}>
            <h2>
              <AccordionButton>
                <Box flex='1' textAlign='left'>
                  {hat?.detailsObject?.data?.name || hat.name}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>Content for {hat.name}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Stack>
  );
};

export default MainContent;

interface MainContentProps {
  tree: IHat[];
}
