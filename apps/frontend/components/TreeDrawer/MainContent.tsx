import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useIsClient, useToast } from 'app-hooks';
import { formatDistanceToNow } from 'date-fns';
import { useAdminOfHats } from 'hats-hooks';
import { AppHat } from 'hats-types';
import {
  getProposedChangesCount,
  handleExportBranch,
  isTopHatOrMutable,
} from 'hats-utils';
import _ from 'lodash';
import { BsChevronRight } from 'react-icons/bs';
import { FiSave, FiShare2 } from 'react-icons/fi';
import { prettyIdToId } from 'shared';
import { Markdown, Modal } from 'ui';
import { Hex } from 'viem';

import { useOverlay } from '../../contexts/OverlayContext';
import { useTreeForm } from '../../contexts/TreeFormContext';
import ImportTreeForm from '../../forms/ImportTreeForm';

const isDraft = (hatId: string, onchainHats: AppHat[]) =>
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
    inactiveHats,
  } = useTreeForm();
  const hasInactiveHats = inactiveHats.length > 0;
  const isClient = useIsClient();

  const { onClose: onCloseTreeDrawer } = _.pick(treeDisclosure, ['onClose']);
  const { onOpen: onOpenHatDrawer } = _.pick(hatDisclosure, ['onOpen']);
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

  const handleExport = (shouldPatchIds: boolean) =>
    handleExportBranch({
      targetHatId: prettyIdToId(treeId),
      treeToDisplay,
      linkedHatIds,
      storedData,
      chainId,
      toast,
      shouldPatchIds,
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
          <Heading color='blackAlpha.800' fontSize={24} fontWeight='medium'>
            {topHatDetails?.name ||
              topHat?.details ||
              topHat?.name ||
              'No Hats'}
          </Heading>
          {topHatDetails?.description && (
            <Markdown>{topHatDetails?.description}</Markdown>
          )}

          {isClient && (
            <Text color='blackAlpha.600' maxW='80%'>
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
          {hasInactiveHats ? (
            <Menu>
              <MenuButton
                as={Button}
                leftIcon={<FiSave />}
                colorScheme='twitter'
                variant='solid'
                isDisabled={treeToDisplay?.length === 1}
              >
                Export
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => handleExport(false)}>
                  <Tooltip label='This option should be used for applying changes to the same tree, to preserve its structure.'>
                    Template for current tree
                  </Tooltip>
                </MenuItem>
                <MenuItem onClick={() => handleExport(true)}>
                  <Tooltip label='This option should be used when creating a new tree.'>
                    Template for new tree
                  </Tooltip>
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button
              leftIcon={<FiSave />}
              colorScheme='twitter'
              variant='solid'
              isDisabled={treeToDisplay?.length === 1}
              onClick={() => handleExport(false)}
            >
              Export
            </Button>
          )}
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
        {_.map(treeToDisplay, (hat: AppHat) => {
          const draft = isDraft(hat.id, onchainHats);
          const changes = getProposedChangesCount(hat.id, storedData);
          // console.log(changes);

          const handleHatClick = () => {
            onCloseTreeDrawer?.();
            onOpenHatDrawer?.();
            setSelectedHatId?.(hat.id);
          };

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

      <Modal
        name='importFile'
        title='Import Draft Tree Changes'
        localOverlay={localOverlay}
      >
        <ImportTreeForm />
      </Modal>
    </Stack>
  );
};

export default MainContent;
