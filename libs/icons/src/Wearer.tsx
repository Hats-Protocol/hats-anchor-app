'use client';

import { createIcon } from '@chakra-ui/react';

const WearerIcon = createIcon({
  displayName: 'WearerIcon',
  viewBox: '0 0 16 16',
  path: [
    <path
      d='M12 1C12.5523 1 13 1.44772 13 2V12.7553C13 12.7553 12 11 8 11C4 11 3 12.7554 3 12.7554V2C3 1.44772 3.44772 1 4 1H12ZM4 0C2.89543 0 2 0.895431 2 2V14C2 15.1046 2.89543 16 4 16H12C13.1046 16 14 15.1046 14 14V2C14 0.895431 13.1046 0 12 0H4Z'
      fill='currentColor'
    />,
    <path
      d='M8 10C9.65685 10 11 8.65685 11 7C11 5.34315 9.65685 4 8 4C6.34315 4 5 5.34315 5 7C5 8.65685 6.34315 10 8 10Z'
      fill='currentColor'
    />,
  ],
});

export default WearerIcon;
