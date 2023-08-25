/* eslint-disable import/prefer-default-export */
import { Image } from '@chakra-ui/react';

import { IControls } from '@/types';

export const initialControls: IControls[] = [
  {
    label: 'Title Only',
    value: 'title',
    icon: <Image src='/icons/title.svg' alt='Title Icon' />,
  },
  // {
  //   label: 'Stats',
  //   value: 'stats',
  //   icon: <Image src='/icons/stats' alt='Stats Icon' />,
  // },
  {
    label: 'Wearers',
    value: 'wearers',
    icon: <Image src='/icons/wearers.svg' alt='Wearers Icon' />,
  },
  // {
  //   label: 'Permissions',
  //   value: 'permissions',
  //   icon: <Image src='/icons/permissions.svg' alt='Permissions Icon' />,
  // },
  // {
  //   label: 'Responsibilities',
  //   value: 'responsibilities',
  //   icon: (
  //     <Image src='/icons/responsibilities.svg' alt='Responsibilities Icon' />
  //   ),
  // },
  {
    label: 'Eligibility',
    value: 'eligibility',
    icon: <Image src='/icons/eligibility.svg' alt='Eligibility Icon' />,
  },
  {
    label: 'Toggle',
    value: 'toggle',
    icon: <Image src='/icons/toggle.svg' alt='Toggle icon' />,
  },
];
