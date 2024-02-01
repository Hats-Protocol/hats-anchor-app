/* eslint-disable no-nested-ternary */
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { Modal } from 'app-components';
import { commify, extendWearers, wearersPerPage } from 'app-utils';
import { useAllWearers, useHatPaginatedWearers } from 'hats-hooks';
import { HatWearer } from 'hats-types';
import {
  exportToCsv,
  filterWearers,
  maxSupplyText,
  // sortWearers,
} from 'hats-utils';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { FaFileCsv, FaSearch } from 'react-icons/fa';

import { useEligibility } from '../../contexts/EligibilityContext';
import { useOverlay } from '../../contexts/OverlayContext';
import WearerRow from './WearerRow';

const WearersList = () => {
  const localOverlay = useOverlay();
  const { setModals, modals } = localOverlay;
  const { chainId, selectedHat, selectedHatDetails, wearersAndControllers } =
    useEligibility();
  const [searchTerm, setSearchTerm] = useState('');

  const maxSupply = _.toNumber(_.get(selectedHat, 'maxSupply', 0));
  const extendedWearers = extendWearers(
    _.get(selectedHat, 'wearers'),
    wearersAndControllers,
  );

  const { wearers: exportWearers } = useAllWearers({
    selectedHat,
    chainId,
    enabled: _.get(modals, 'hatWearers'),
  });

  const {
    paginatedWearers,
    nextPage,
    prevPage,
    isLoading,
    isFetching,
    currentPage,
  } = useHatPaginatedWearers({
    hatId: selectedHat?.id,
    chainId,
  });

  const filteredWearers = useMemo(() => {
    if (!extendedWearers) return undefined;
    return _.slice(
      filterWearers(searchTerm, extendedWearers),
      0,
      6,
    ) as HatWearer[];
  }, [searchTerm, extendedWearers]);

  return (
    <>
      <Stack spacing={4}>
        <Flex justify='space-between' alignItems='center'>
          <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
            Hat Wearers
          </Heading>

          <Flex gap={1}>
            <Text>{_.get(selectedHat, 'currentSupply')}</Text>
            <HStack color='gray.400' spacing={1}>
              <Text>of</Text>
              <Tooltip
                label={maxSupply && commify(maxSupply)}
                placement='left'
                hasArrow
              >
                <Text fontFamily='mono'>{maxSupplyText(maxSupply)}</Text>
              </Tooltip>
            </HStack>
          </Flex>
        </Flex>

        {_.gt(_.size(extendedWearers), 5) && (
          <InputGroup>
            <InputLeftElement pointerEvents='none'>
              <FaSearch />
            </InputLeftElement>
            <Input
              // add left icon inside of input field
              placeholder='Find by address (0x) or ens (.eth)'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        )}
        {/* Wearers list */}
        {_.map(filteredWearers, (w: HatWearer) => (
          <WearerRow key={w.id} wearer={w} />
        ))}
        {_.isEmpty(filteredWearers) && (
          <Box>
            <Flex justify='center' h='70px' align='center'>
              <Text>No wearers currently</Text>
            </Flex>
            <Divider />
          </Box>
        )}

        <Flex justify='space-between' align='center'>
          {_.gt(_.size(extendedWearers), 6) && (
            <Text
              onClick={() => setModals?.({ hatWearers: true })}
              cursor='pointer'
              _hover={{
                textDecor: 'underline',
              }}
            >
              Show all {_.get(selectedHat, 'currentSupply')} wearers
            </Text>
          )}
        </Flex>
      </Stack>

      <Modal
        name='hatWearers'
        localOverlay={localOverlay}
        customHeader={
          <Flex
            justify='space-between'
            alignItems='center'
            mt={8}
            px={6}
            pb={4}
          >
            <Heading fontSize='24px'>Hat Wearers</Heading>
            <Button
              onClick={() =>
                exportWearers &&
                exportToCsv(exportWearers, selectedHatDetails?.name)
              }
              leftIcon={<FaFileCsv />}
              colorScheme='blue'
            >
              Export
            </Button>
          </Flex>
        }
        footer={
          <Flex justify='center' px={6} pb={6} w='full'>
            <Button
              variant='ghost'
              onClick={() => {
                prevPage();
              }}
              isDisabled={currentPage === 0}
            >
              {currentPage > 1 ? `Previous (${currentPage - 1})` : 'Previous'}
            </Button>
            <Button
              variant='ghost'
              onClick={() => {
                nextPage();
              }}
              isDisabled={_.size(paginatedWearers) < wearersPerPage}
            >
              {`Next (${currentPage + 1})`}
            </Button>
          </Flex>
        }
      >
        <Flex direction='column' gap={4}>
          {isLoading || isFetching ? (
            <Spinner />
          ) : (
            paginatedWearers?.map((w: HatWearer) => (
              <WearerRow key={w.id} wearer={w} />
            ))
          )}
        </Flex>
      </Modal>
    </>
  );
};

export default WearersList;
