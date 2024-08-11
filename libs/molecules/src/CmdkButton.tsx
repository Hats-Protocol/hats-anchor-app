'use client';

import { Icon, IconButton, Tooltip } from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import _ from 'lodash';
import { useMemo } from 'react';
import { BsSearch } from 'react-icons/bs';
import { getOperatingSystem } from 'utils';

const CommandPaletteButton = () => {
  const { setCommandPalette: setOpen } = useOverlay();

  const isCtrl = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return _.includes(['Windows', 'Linux', 'Unix'], getOperatingSystem(window));
  }, []);

  return (
    <Tooltip label={`Search with ${isCtrl ? 'Ctrl' : 'Cmd'} + K`}>
      <IconButton
        icon={<Icon as={BsSearch} h='25px' w='25px' />}
        onClick={() => setOpen?.(true)}
        aria-label='Search'
        variant='ghost'
      />
    </Tooltip>
  );
};

export default CommandPaletteButton;
