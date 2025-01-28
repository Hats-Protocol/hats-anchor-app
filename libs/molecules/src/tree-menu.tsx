'use client';

import { CONFIG } from '@hatsprotocol/config';
import { initialControls } from '@hatsprotocol/constants';
import { HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useTreeForm } from 'contexts';
import { formatDistanceToNow } from 'date-fns';
import { useMediaStyles } from 'hooks';
import { first, get, gt, size } from 'lodash';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { AiOutlineDoubleLeft } from 'react-icons/ai';
import { BsPencil, BsToggle2Off, BsToggles } from 'react-icons/bs';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { Controls } from 'types';
import {
  BaseCheckbox,
  Button,
  cn,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
} from 'ui';
import { chainsMap, explorerUrl } from 'utils';

import { EventHistory } from './event-history';

const History = dynamic(() => import('icons').then((mod) => mod.History));

// TODO check for more specific error

const TreeMenu = () => {
  const { setModals } = useOverlay();
  const {
    chainId,
    treeToDisplay,
    treeEvents,
    editMode,
    setSelectedOption,
    selectedOption,
    showInactiveHats,
    setShowInactiveHats,
    toggleEditMode,
    onOpenTreeDrawer,
    treeError,
  } = useTreeForm();
  const [isOpen, setIsOpen] = useState<string | boolean>(false); // TODO CheckedState is string | boolean
  const [localLastTimestamp, setLocalLastTimestamp] = React.useState<string>();
  const { isClient } = useMediaStyles();

  useEffect(() => {
    if (!isClient || !get(first(treeEvents), 'timestamp')) return;
    setLocalLastTimestamp(
      `${
        get(first(treeEvents), 'timestamp') &&
        formatDistanceToNow(new Date(Number(get(first(treeEvents), 'timestamp')) * 1000))
      } ago`,
    );
  }, [treeEvents, isClient]);

  if (!chainId) return null;
  const chain = chainsMap(chainId);

  // const controls = checkPermissionsResponsibilities(
  //   treeToDisplay,
  //   initialControls,
  // );

  return (
    <div className='top-75 absolute z-[4] mb-5 flex h-[70px] w-full items-center justify-between bg-white/70 px-3'>
      <div className='flex w-full items-center justify-between'>
        <div className='flex items-center'>
          <Button
            className='border border-[#0987A0] bg-[#C4F1F9] text-[#065666]'
            disabled={!treeToDisplay || !!treeError}
            onClick={toggleEditMode}
          >
            {editMode ? (
              <IoCloseCircleOutline className='mr-1 size-4' />
            ) : (
              <BsPencil className='mr-1 size-4 text-[#065666]' />
            )}
            {editMode ? 'Leave Edit Mode' : 'Edit Tree'}
          </Button>
          {/* <Button colorScheme="teal" mr={3}>
                Table View
              </Button> */}
          <Popover open={isOpen as boolean} onOpenChange={(open) => setIsOpen(open)}>
            <PopoverTrigger>
              <Button
                disabled={editMode || !!treeError}
                variant={isOpen ? 'default' : 'outline'}
                className={cn('font-medium', isOpen ? 'bg-blue-500' : 'bg-white')}
              >
                <BsToggles className='mr-1 size-4' />
                View Controls
                {isOpen ? <FaChevronUp className='ml-1 size-4' /> : <FaChevronDown className='ml-1 size-4' />}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80'>
              <div className='p-6'>
                <RadioGroup
                  onValueChange={(value) => setSelectedOption?.(value)}
                  value={selectedOption}
                  className='w-full'
                >
                  <div className='flex flex-col gap-3'>
                    {initialControls.map((control: Controls) => (
                      <RadioGroupItem value={control.value} key={control.value}>
                        <div className='flex items-center gap-2'>
                          {control.icon}
                          <p>{control.label}</p>
                        </div>
                      </RadioGroupItem>
                    ))}
                  </div>
                </RadioGroup>
                <hr className='my-4' />
                <BaseCheckbox
                  checked={showInactiveHats}
                  onCheckedChange={(checked) => setShowInactiveHats?.(checked as boolean)}
                >
                  <div className='flex items-center gap-2'>
                    <BsToggle2Off className='size-4 text-gray-500' />
                    <p>Inactive Hats</p>
                  </div>
                </BaseCheckbox>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {editMode ? (
          <Button variant='outline' className='border-gray-700 bg-white/90' onClick={() => onOpenTreeDrawer?.()}>
            <AiOutlineDoubleLeft className='mr-1 size-4' />
            Draft Changes List
          </Button>
        ) : (
          <div className='flex items-center gap-4'>
            {/* {!_.isEmpty(treeToDisplay) && (
              <Stack minH='55px' spacing={1}>
                <Text color='blue.500'>
                  <b>{_.size(treeToDisplay) || 0}</b> hat
                  {_.size(treeToDisplay) > 1 ? 's' : ''} in this {CONFIG.tree}
                </Text>
                {updatedHats && (
                  <Button
                    variant='outlineMatch'
                    colorScheme='blue.500'
                    onClick={() => setStoredData?.([])}
                    size='xs'
                  >
                    Clear Updates
                  </Button>
                )}
              </Stack>
            )} */}

            <div className='flex items-center gap-1'>
              <div className='font-sm flex items-center gap-1'>
                <p>{`${CONFIG.appName} ${CONFIG.protocolVersion}:`}</p>

                <Link href={`${explorerUrl(chainId)}/address/${HATS_V1}`} isExternal>
                  <div className='flex items-center gap-1'>
                    <p className='font-medium'>{chain?.name}</p>
                    <Button aria-label='Explorer contract address' size='xs' variant='ghost'>
                      <FiExternalLink className='size-4' />
                    </Button>
                  </div>
                </Link>
              </div>

              {!treeError && (
                <Popover>
                  <PopoverTrigger>
                    <div className='flex cursor-pointer items-center gap-1 text-sm'>
                      <p>Last event: </p>
                      <p className='mr-2 font-medium'>{localLastTimestamp || '-'}</p>

                      <History className='size-4' />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className='mr-4 w-80'>
                    <div className='space-y-2'>
                      <div>
                        <h4 className='mb-1 text-sm font-medium uppercase'>Event history</h4>

                        <EventHistory type='tree' count={6} />

                        {gt(size(treeEvents), 4) && (
                          <>
                            <hr className='my-2' />

                            <Button
                              onClick={() => setModals?.({ events: true })}
                              variant='link'
                              className='text-blue-500'
                            >
                              View Full History
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { TreeMenu };
