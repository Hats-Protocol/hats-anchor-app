/* eslint-disable import/prefer-default-export */
import { Icon } from '@chakra-ui/react';
import {
  BsFileFont,
  BsPersonBadge,
  BsShieldLock,
  BsToggles2,
} from 'react-icons/bs';
import { Controls } from 'types';

export const initialControls: Controls[] = [
  {
    label: 'Title Only',
    value: 'title',
    icon: <Icon as={BsFileFont} boxSize={4} color='gray.500' />,
  },
  // {
  //   label: 'Stats',
  //   value: 'stats',
  //   icon: <Icon as={Stats} boxSize={4} color='gray.500' />,
  // },
  {
    label: 'Wearers',
    value: 'wearers',
    icon: <Icon as={BsPersonBadge} boxSize={4} color='gray.500' />,
  },
  // {
  //   label: 'Permissions',
  //   value: 'permissions',
  //   icon: <Icon as={Key} boxSize={4} color='gray.500' />,
  // },
  // {
  //   label: 'Responsibilities',
  //   value: 'responsibilities',
  //   icon: (
  //     <Icon as={TaskList} boxSize={4} color='gray.500' />
  //   ),
  // },
  {
    label: 'Eligibility',
    value: 'eligibility',
    icon: <Icon as={BsShieldLock} boxSize={4} color='gray.500' />,
  },
  {
    label: 'Toggle',
    value: 'toggle',
    icon: <Icon as={BsToggles2} boxSize={4} color='gray.500' />,
  },
];
