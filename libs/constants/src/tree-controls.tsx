import { BsFileFont, BsPersonBadge, BsShieldLock, BsToggles2 } from 'react-icons/bs';
import { Controls } from 'types';

export const initialControls: Controls[] = [
  {
    label: 'Title Only',
    value: 'title',
    icon: <BsFileFont className='h-4 w-4 text-gray-500' />,
  },
  // {
  //   label: 'Stats',
  //   value: 'stats',
  //   icon: <Stats  className='h-4 w-4 text-gray-500' />,
  // },
  {
    label: 'Wearers',
    value: 'wearers',
    icon: <BsPersonBadge className='h-4 w-4 text-gray-500' />,
  },
  // {
  //   label: 'Permissions',
  //   value: 'permissions',
  //   icon: <Key  className='h-4 w-4 text-gray-500' />,
  // },
  // {
  //   label: 'Responsibilities',
  //   value: 'responsibilities',
  //   icon: (
  //     <TaskList  className='h-4 w-4 text-gray-500' />
  //   ),
  // },
  {
    label: 'Eligibility',
    value: 'eligibility',
    icon: <BsShieldLock className='h-4 w-4 text-gray-500' />,
  },
  {
    label: 'Toggle',
    value: 'toggle',
    icon: <BsToggles2 className='h-4 w-4 text-gray-500' />,
  },
];
