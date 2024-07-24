'use client';

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
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { Modal, useOverlay, useTreeForm } from 'contexts';
import { formatDistanceToNow } from 'date-fns';
import { ImportTreeForm } from 'forms';
import { useAdminOfHats } from 'hats-hooks';
import {
  getProposedChangesCount,
  handleExportBranch,
  isTopHatOrMutable,
} from 'hats-utils';
import { useMediaStyles, useToast } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import { BsChevronRight } from 'react-icons/bs';
import { FiSave, FiShare2 } from 'react-icons/fi';
import { AppHat } from 'types';
import { Hex } from 'viem';

const Markdown = dynamic(() => import('ui').then((mod) => mod.Markdown));

const isDraft = (hatId: string, onchainHats: AppHat[]) =>
  !_.includes(_.map(onchainHats, 'id'), hatId);

const MainContent = ({ isExpanded }: { isExpanded: boolean }) => {
  const {
    topHat,
    onchainHats,
    treeToDisplay,
    treeToDisplayWithInactiveHats,
    storedData,
    treeEvents,
    topHatDetails,
    chainId,
    linkedHatIds,
    onCloseTreeDrawer,
    onOpenHatDrawer,
    editMode,
  } = useTreeForm();
  const { isClient } = useMediaStyles();
  const toast = useToast();
  const localOverlay = useOverlay();

  const { setModals } = localOverlay;

  const topHatCreated = _.get(_.last(_.get(topHat, 'events')), 'timestamp');

  const openImportModal = () => {
    setModals?.({ importFile: true });
  };

  const hatIds = _.filter(
    _.map(storedData, 'id'),
    (hatId: string | undefined) => hatId !== undefined,
  ) as Hex[];
  const { adminHatIds } = useAdminOfHats({ hatIds, chainId });

  const handleExport = () =>
    handleExportBranch({
      targetHatId: topHat?.id,
      treeToDisplayWithInactiveHats,
      linkedHatIds,
      storedData,
      chainId,
      toast,
    });

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
        <Stack w='75%'>
          <Heading variant='lightMedium'>
            {topHatDetails?.name ||
              topHat?.details ||
              topHat?.name ||
              'No Hats'}
          </Heading>
          {topHatDetails?.description && (
            <Markdown>{topHatDetails?.description}</Markdown>
          )}

          {isClient && (
            <Text variant='light' maxW='80%'>
              Created{' '}
              {topHatCreated &&
                formatDistanceToNow(
                  new Date(Number(topHatCreated) * 1000),
                )}{' '}
              ago. Last edited {/* treeEvents is sorted by recent timestamp */}
              {_.get(_.first(treeEvents), 'timestamp') &&
                formatDistanceToNow(
                  new Date(
                    Number(_.get(_.first(treeEvents), 'timestamp')) * 1000,
                  ),
                )}{' '}
              ago.
            </Text>
          )}

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
        <Text variant='lightMedium' size='xl'>
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
        {_.map(treeToDisplay, (hat: AppHat) => {
          const draft = isDraft(hat.id, onchainHats);
          const changes = getProposedChangesCount(hat.id, storedData);
          // console.log(changes);

          const hatId = hatIdDecimalToIp(BigInt(hat.id));
          // get hat name for list display, default to details name
          let displayName = _.get(hat, 'detailsObject.data.name') || hat.name;
          if (displayName === hatId && !_.startsWith(hat.details, 'ipfs://')) {
            displayName = hat.details;
          }
          const localDisplayName = _.get(hat, 'displayName', '');
          if (localDisplayName !== '') {
            displayName = localDisplayName;
          }

          const handleHatClick = () => {
            posthog.capture('Opened Hat Drawer', {
              chain_id: chainId,
              hat_id: hatId,
              hat_name: displayName,
              draft,
              edit_mode: editMode,
              from: 'Tree Drawer',
            });
            onCloseTreeDrawer?.();
            onOpenHatDrawer?.(hat.id);
          };

          const isAdmin = _.includes(adminHatIds, hat.id);

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
                  {displayName && displayName !== hatId && (
                    <Text
                      maxW={hat.mutable && !changes ? '300px' : '160px'}
                      isTruncated
                    >
                      {displayName}
                    </Text>
                  )}
                </HStack>
                <HStack>
                  {draft ? (
                    <Badge
                      colorScheme='green'
                      fontSize='sm'
                      variant={isAdmin ? 'solid' : 'outline'}
                      textTransform='uppercase'
                    >
                      {isAdmin ? 'Deployable Draft' : 'New!'}
                    </Badge>
                  ) : (
                    changes && (
                      <Badge
                        colorScheme={isAdmin ? 'blue' : 'cyan'}
                        fontSize='sm'
                        variant={isAdmin ? 'solid' : 'outline'}
                        textTransform='uppercase'
                      >
                        {changes}
                        {isAdmin ? ' Deployable Edit' : ' Change'}
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

      <Modal name='importFile' title='Import Draft Tree Changes'>
        <ImportTreeForm />
      </Modal>
    </Stack>
  );
};

export default MainContent;
