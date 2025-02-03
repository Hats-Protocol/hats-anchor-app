'use client';

import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat } from 'contexts';
import { useMediaStyles } from 'hooks';
import { get } from 'lodash';
import dynamic from 'next/dynamic';
import { Button } from 'ui';

import { MobileBottomMenu } from './mobile-bottom-menu';

const BoxArrowDown = dynamic(() => import('react-icons/pi').then((i) => i.PiArrowSquareDown));
const BoxArrowLeft = dynamic(() => import('react-icons/pi').then((i) => i.PiArrowSquareLeft));
const BoxArrowRight = dynamic(() => import('react-icons/pi').then((i) => i.PiArrowSquareRight));
const BoxArrowUp = dynamic(() => import('react-icons/pi').then((i) => i.PiArrowSquareUp));

const BottomMenu = ({ show }: { show?: boolean }) => {
  const { hierarchy, handleSelectHat } = useSelectedHat();
  const { isMobile } = useMediaStyles();

  if (isMobile) {
    return <MobileBottomMenu show={show} />;
  }

  const selectHat = (name: string) => {
    const newHatId = get(hierarchy, name);
    handleSelectHat?.(newHatId);
  };

  return (
    <div className='absolute bottom-0 z-[14] w-full bg-white/90'>
      <div className='flex justify-between border-t border-gray-200 p-4'>
        {hierarchy?.leftSibling ? (
          <Button variant='outline' onClick={() => selectHat('leftSibling')}>
            <BoxArrowLeft className='mr-2 h-5 w-5' />
            <p className='text-medium'>{hatIdDecimalToIp(BigInt(hierarchy?.leftSibling))}</p>
          </Button>
        ) : (
          <div className='w-16' />
        )}

        <div className='flex items-center gap-2'>
          {hierarchy?.parentId ? (
            <Button variant='outline' onClick={() => selectHat('parentId')}>
              <BoxArrowUp className='mr-2 h-5 w-5' />
              <p className='text-medium'>{hatIdDecimalToIp(BigInt(hierarchy?.parentId))}</p>
            </Button>
          ) : (
            <div className='w-16' />
          )}

          {hierarchy?.firstChild ? (
            <Button variant='outline' onClick={() => selectHat('firstChild')}>
              <p className='text-medium'>{hatIdDecimalToIp(BigInt(hierarchy?.firstChild))}</p>
              <BoxArrowDown className='ml-2 h-5 w-5' />
            </Button>
          ) : (
            <div className='w-16' />
          )}
        </div>

        {hierarchy?.rightSibling ? (
          <Button variant='outline' onClick={() => selectHat('rightSibling')}>
            <p className='text-medium'>{hatIdDecimalToIp(BigInt(hierarchy?.rightSibling))}</p>
            <BoxArrowRight className='ml-2 h-5 w-5' />
          </Button>
        ) : (
          <div className='w-16' />
        )}
      </div>
    </div>
  );
};

export { BottomMenu };
