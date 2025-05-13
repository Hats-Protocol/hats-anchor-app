'use client';

import { Modal, useOverlay, useSelectedHat } from 'contexts';
import { useAllWearers, useHatPaginatedWearers } from 'hats-hooks';
import { exportToCsv } from 'hats-utils';
import { get, map, size } from 'lodash';
import { FaFileCsv } from 'react-icons/fa';
import { HatWearer } from 'types';
import { Button, ScrollArea, Spinner } from 'ui';
import { wearersPerPage } from 'utils';
import { Hex } from 'viem';

import { WearerRow } from './wearer-row';

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
    enabled: get(modals, 'hatWearers') || false,
  });

  return (
    <Modal
      name='hatWearers'
      size='lg'
      customHeader={
        <div className='mt-8 flex items-center justify-between pb-4'>
          <h2 className='text-2xl'>Hat Wearers</h2>
          <Button onClick={() => exportWearers && exportToCsv(exportWearers, selectedHatDetails?.name)}>
            <FaFileCsv />
            Export
          </Button>
        </div>
      }
      footer={
        <div className='flex w-full justify-center px-6 pb-6'>
          <Button
            variant='ghost'
            onClick={() => {
              prevPage();
            }}
            disabled={currentPage === 0}
          >
            {currentPage > 1 ? `Previous (${currentPage - 1})` : 'Previous'}
          </Button>
          <Button
            variant='ghost'
            onClick={() => {
              nextPage();
            }}
            disabled={size(paginatedWearers) < wearersPerPage}
          >
            {`Next (${currentPage + 1})`}
          </Button>
        </div>
      }
    >
      <div className='flex flex-col gap-4'>
        {isLoading || isFetching ? (
          <div className='flex h-[600px] items-center justify-center'>
            <Spinner />
          </div>
        ) : (
          <ScrollArea className='max-h-[600px]'>
            {map(paginatedWearers, (w: HatWearer) => (
              <div className='mb-2' key={w.id}>
                <WearerRow
                  wearer={w}
                  setChangeStatusWearer={setChangeStatusWearer}
                  setWearerToTransferFrom={setWearerToTransferFrom}
                />
              </div>
            ))}
          </ScrollArea>
        )}
      </div>
    </Modal>
  );
};

export { FullWearersListModal };
