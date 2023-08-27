import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import { BsChevronRight } from 'react-icons/bs';
import { Hex } from 'viem';

import { useTreeForm } from '@/contexts/TreeFormContext';
import {
  getProposedChangesCount,
  idToPrettyId,
  isTopHatOrMutable,
  prettyIdToIp,
} from '@/lib/hats';
import { IHat } from '@/types';

const isDraft = (hatId: string, onchainHats: IHat[]) =>
  !_.includes(_.map(onchainHats, 'id'), hatId);

const MainContent = () => {
  const {
    topHat,
    onchainHats,
    orgChartTree,
    storedData,
    setSelectedHatId,
    treeDisclosure,
    hatDisclosure,
    treeEvents,
  } = useTreeForm();
  const lastEvent = _.last(treeEvents);

  const { onClose: onCloseTreeDrawer } = _.pick(treeDisclosure, ['onClose']);
  const { onOpen: onOpenHatDrawer } = _.pick(hatDisclosure, ['onOpen']);

  if (!onchainHats || !orgChartTree) return null;

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
          {topHat?.detailsObject?.data?.name || topHat?.name || 'No Hats'}
        </Heading>
        {topHat?.detailsObject?.data?.description && (
          <Text color='blackAlpha.700'>
            {topHat?.detailsObject?.data?.description || 'No Description'}
          </Text>
        )}

        <Text color='blackAlpha.600'>
          Created{' '}
          {_.get(_.first(treeEvents), 'timestamp') &&
            formatDistanceToNow(
              new Date(Number(_.get(_.first(treeEvents), 'timestamp')) * 1000),
            )}{' '}
          ago. Last edited{' '}
          {/* maybe we're looking for the last change in the tree, not the top hat? */}
          {_.get(lastEvent, 'timestamp') &&
            formatDistanceToNow(
              new Date(Number(_.get(lastEvent, 'timestamp')) * 1000),
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
        {_.map(orgChartTree, (hat) => {
          const draft = isDraft(hat.id, onchainHats);
          const changes = getProposedChangesCount(hat.id, storedData);

          const handleHatClick = () => {
            onCloseTreeDrawer?.();
            onOpenHatDrawer?.();
            setSelectedHatId?.(hat.id);
          };

          return (
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
                isDisabled={!isTopHatOrMutable(hat)}
                onClick={handleHatClick}
              >
                <HStack>
                  <Text>{prettyIdToIp(idToPrettyId(hat.id))}</Text>
                  <Text>{hat?.detailsObject?.data?.name || hat.name}</Text>
                </HStack>
                <HStack>
                  {draft ? (
                    <Badge colorScheme='green' fontSize='sm' variant='outline'>
                      NEW!
                    </Badge>
                  ) : (
                    changes && (
                      <Badge colorScheme='cyan' fontSize='sm' variant='outline'>
                        {changes} CHANGE
                        {_.gt(changes, 1) ? 'S' : ''}
                      </Badge>
                    )
                  )}
                  {!isTopHatOrMutable(hat) && (
                    <Badge colorScheme='gray' fontSize='sm' variant='outline'>
                      IMMUTABLE
                    </Badge>
                  )}

                  <BsChevronRight />
                </HStack>
              </Button>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
};

export default MainContent;

interface MainContentProps {
  handleHatClick: (hatId: Hex) => void;
}
