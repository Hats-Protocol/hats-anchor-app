/* eslint-disable import/prefer-default-export */
import { Icon } from '@chakra-ui/react';
import { Controls } from 'hats-types';
import {
  BsFileFont,
  BsPersonBadge,
  BsShieldLock,
  BsToggles2,
} from 'react-icons/bs';

export const initialControls: Controls[] = [
  {
    label: 'Title Only',
    value: 'title',
    icon: <Icon as={BsFileFont} w={4} h={4} color='gray.500' />,
  },
  // {
  //   label: 'Stats',
  //   value: 'stats',
  //   icon: <Image src='/icons/stats' alt='Stats Icon' />,
  // },
  {
    label: 'Wearers',
    value: 'wearers',
    icon: <Icon as={BsPersonBadge} w={4} h={4} color='gray.500' />,
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
    icon: <Icon as={BsShieldLock} w={4} h={4} color='gray.500' />,
  },
  {
    label: 'Toggle',
    value: 'toggle',
    icon: <Icon as={BsToggles2} w={4} h={4} color='gray.500' />,
  },
];
