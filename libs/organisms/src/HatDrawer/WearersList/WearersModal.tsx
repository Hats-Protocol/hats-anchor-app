'use client';

import { Button, Flex, Heading, Spinner } from '@chakra-ui/react';
import { Modal, useOverlay, useSelectedHat } from 'contexts';
import { useAllWearers, useHatPaginatedWearers } from 'hats-hooks';
import { exportToCsv } from 'hats-utils';
import _ from 'lodash';
import { FaFileCsv } from 'react-icons/fa';
import { HatWearer } from 'types';
import { wearersPerPage } from 'utils';
import { Hex } from 'viem';

import WearerRow from './WearerRow';

const FullWearersListModal = ({
  setChangeStatusWearer,
  setWearerToTransferFrom,
}: {
  setChangeStatusWearer: (wearer: Hex) => void;
  setWearerToTransferFrom: (wearer: Hex) => void;
}) => {
  const localOverlay = useOverlay();
  const { modals } = localOverlay;
  const { selectedHatDetails, selectedHat, chainId } = useSelectedHat();
  const { paginatedWearers, nextPage, prevPage, isLoading, isFetching, currentPage } = useHatPaginatedWearers({
    hatId: selectedHat?.id,
    chainId,
  });

  const { wearers: exportWearers } = useAllWearers({
    selectedHat,
    chainId,
    enabled: _.get(modals, 'hatWearers') || false,
  });

  return (
    <Modal
      name='hatWearers'
      customHeader={
        <Flex justify='space-between' alignItems='center' mt={8} px={6} pb={4}>
          <Heading size='2xl'>Hat Wearers</Heading>
          <Button
            onClick={() => exportWearers && exportToCsv(exportWearers, selectedHatDetails?.name)}
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
            <WearerRow
              key={w.id}
              wearer={w}
              setChangeStatusWearer={setChangeStatusWearer}
              setWearerToTransferFrom={setWearerToTransferFrom}
            />
          ))
        )}
      </Flex>
    </Modal>
  );
};

export default FullWearersListModal;
