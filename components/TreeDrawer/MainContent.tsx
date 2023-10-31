import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  hatIdDecimalToIp,
  treeIdHexToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import { BsChevronRight } from 'react-icons/bs';
import { FiSave, FiShare2 } from 'react-icons/fi';

import Markdown from '@/components/atoms/Markdown';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useToast from '@/hooks/useToast';
import {
  flattenHatData,
  getProposedChangesCount,
  isTopHatOrMutable,
  mergeHatsWithStoredData,
  prepareExportTree,
  prettyIdToId,
} from '@/lib/hats';
import { Hat } from '@/types';

const isDraft = (hatId: string, onchainHats: Hat[]) =>
  !_.includes(_.map(onchainHats, 'id'), hatId);

const MainContent = ({ isExpanded }: { isExpanded: boolean }) => {
  const {
    topHat,
    onchainHats,
    treeToDisplay,
    storedData,
    setSelectedHatId,
    treeDisclosure,
    hatDisclosure,
    treeEvents,
    topHatDetails,
    treeId,
    chainId,
    linkedHatIds,
  } = useTreeForm();

  const { onClose: onCloseTreeDrawer } = _.pick(treeDisclosure, ['onClose']);
  const { onOpen: onOpenHatDrawer } = _.pick(hatDisclosure, ['onOpen']);
  const toast = useToast();
  const decimalTreeId = treeId && treeIdHexToDecimal(treeId);
  const localOverlay = useOverlay();

  const { setModals } = localOverlay;

  const openImportModal = () => {
    setModals?.({ importFile: true });
  };

  const handleExport = () => {
    if (!treeToDisplay) return;
    const hatsWithoutLinkedHats = _.filter(
      treeToDisplay,
      (hat) => hat.id && !linkedHatIds?.includes(hat.id),
    );
    // if the top hat is linked, we need to set its admin id to itself
    const topHatId = prettyIdToId(treeId);
    const targetHat = _.find(hatsWithoutLinkedHats, { id: topHatId });
    if (
      targetHat &&
      targetHat.admin?.id &&
      linkedHatIds?.includes(targetHat.admin?.id)
    ) {
      targetHat.admin.id = topHatId;
    }
    const onChainHats = flattenHatData(hatsWithoutLinkedHats);
    const mergedHats = mergeHatsWithStoredData(onChainHats, storedData);
    const preparedTree = prepareExportTree(mergedHats);
    const fileData = JSON.stringify(preparedTree);

    const blob = new Blob([fileData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    // TODO add unix timestamp so don't get (1) on subsequent downloads
    // update file name validation also, based on this ^
    link.download = `chain-${chainId}-tree-${decimalTreeId}.json`;
    link.href = url;
    link.click();
    toast.success({
      title: `Exported tree #${decimalTreeId} to your desktop`,
    });
  };

  if (!onchainHats || !treeToDisplay) return null;

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
      <HStack alignItems='flex-start' justifyContent='space-between'>
        <Stack>
          <Heading color='blackAlpha.800' fontSize={24} fontWeight='medium'>
            {topHatDetails?.name || topHat?.name || 'No Hats'}
          </Heading>
          {topHatDetails?.description && (
            <Markdown>{topHatDetails?.description}</Markdown>
          )}

          <Text color='blackAlpha.600'>
            Created{' '}
            {_.get(_.first(treeEvents), 'timestamp') &&
              formatDistanceToNow(
                new Date(
                  Number(_.get(_.first(treeEvents), 'timestamp')) * 1000,
                ),
              )}{' '}
            ago. Last edited{' '}
            {/* maybe we're looking for the last change in the tree, not the top hat? */}
            {_.get(_.last(treeEvents), 'timestamp') &&
              formatDistanceToNow(
                new Date(Number(_.get(_.last(treeEvents), 'timestamp')) * 1000),
              )}{' '}
            ago.
          </Text>
          {!topHatDetails?.description && <Flex h={12} />}
        </Stack>

        <VStack>
          <Button
            leftIcon={<FiShare2 />}
            colorScheme='gray'
            variant='outline'
            onClick={openImportModal}
          >
            Import
          </Button>
          <Button
            leftIcon={<FiSave />}
            colorScheme='twitter'
            variant='solid'
            isDisabled={treeToDisplay?.length === 1}
            onClick={handleExport}
          >
            Export
          </Button>
        </VStack>
      </HStack>

      <Stack>
        <Text color='blackAlpha.800' fontSize='xl' fontWeight='medium'>
          Drafted Changes
        </Text>
        <Text>
          Propose changes to any hat. Deploy changes to the Hats you control.
        </Text>
      </Stack>
      <Box
        overflow='scroll'
        height={isExpanded ? '200px' : '400px'}
        borderY='1px solid'
        borderColor='gray.200'
      >
        {_.map(treeToDisplay, (hat) => {
          const draft = isDraft(hat.id, onchainHats);
          const changes = getProposedChangesCount(hat.id, storedData);
          // console.log('storedData', storedData);

          const handleHatClick = () => {
            onCloseTreeDrawer?.();
            onOpenHatDrawer?.();
            setSelectedHatId?.(hat.id);
          };

          const hatId = hatIdDecimalToIp(BigInt(hat.id));
          // get hat name for list display
          let displayName =
            _.get(hat, 'newName') || _.get(hat, 'detailsObject.data.name');
          if (!displayName && !_.startsWith(hat.details, 'ipfs://')) {
            displayName = hat.details;
          }
          if (!displayName && hat.name !== hatId) {
            displayName = hat.name;
          }

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
                onClick={handleHatClick}
              >
                <HStack>
                  <Text>{hatId}</Text>
                  {displayName && (
                    <Text maxW={hat.mutable ? '300px' : '200px'} isTruncated>
                      {displayName}
                    </Text>
                  )}
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
