'use client';

import { useOverlay } from 'contexts';
import { includes } from 'lodash';
import { useMemo } from 'react';
import { BsSearch } from 'react-icons/bs';
import { Button, Tooltip } from 'ui';
import { getOperatingSystem } from 'utils';

const CommandPaletteButton = () => {
  const { setCommandPalette: setOpen } = useOverlay();

  const isCtrl = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return includes(['Windows', 'Linux', 'Unix'], getOperatingSystem(window));
  }, []);

  return (
    <Tooltip label={`Search with ${isCtrl ? 'Ctrl' : 'Cmd'} + K`}>
      <Button onClick={() => setOpen?.(true)} aria-label='Search' variant='ghost'>
        <BsSearch className='h-5 w-5' />
      </Button>
    </Tooltip>
  );
};

export { CommandPaletteButton };
