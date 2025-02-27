'use client';

import { safeUrl } from 'hats-utils';
import { useCouncilDetails, useSafeDetails } from 'hooks';
import { get, size, toNumber } from 'lodash';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { AiOutlineDollar, AiOutlineSetting, AiOutlineSwap } from 'react-icons/ai';
import { BsPersonBadge } from 'react-icons/bs';
import { HiCog } from 'react-icons/hi';
import { SupportedChains } from 'types';
import { cn } from 'ui';
import { parseCouncilSlug } from 'utils';

export interface CouncilsBottomMenuProps {
  councilSlug: string;
}

const SafeIcon = dynamic(() => import('icons').then((mod) => mod.Safe), {
  ssr: false,
});

export const CouncilsBottomMenu = ({ councilSlug }: CouncilsBottomMenuProps) => {
  const pathname = usePathname();
  const { chainId, address } = parseCouncilSlug(councilSlug);

  const { data: councilDetails } = useCouncilDetails({ chainId: chainId || undefined, address });
  const primarySignerHat = get(councilDetails, 'signerHats[0]');

  const { data: signers } = useSafeDetails({
    chainId: chainId || undefined,
    safeAddress: get(councilDetails, 'safe'),
  });

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  // Define menu items based on the Figma design
  const menuItems = [
    {
      name: 'Safe',
      href: councilDetails?.safe ? safeUrl(chainId as SupportedChains, councilDetails.safe) : '#',
      icon: SafeIcon,
      exact: true,
      disabled: !councilDetails?.safe || size(signers) < toNumber(get(councilDetails, 'minThreshold')),
    },
    {
      name: 'Transactions',
      href: `#`,
      icon: AiOutlineSwap,
      disabled: true,
      comingSoon: true,
    },
    {
      name: 'Assets',
      href: `#`,
      icon: AiOutlineDollar,
      disabled: true,
    },
    {
      name: 'Members',
      href: `/councils/${councilSlug}/members`,
      icon: BsPersonBadge,
      disabled: false,
    },
    {
      name: 'Manage',
      href: `/councils/${councilSlug}/manage`,
      icon: AiOutlineSetting,
      disabled: false,
    },
  ];

  // Add Dev button if in dev mode
  if (isDev) {
    menuItems.push({
      name: 'Dev',
      href: `/councils/${councilSlug}/dev`,
      icon: HiCog,
      disabled: false,
    });
  }

  // Limit to 5 items for the bottom menu
  const visibleMenuItems = menuItems.slice(0, 5);

  // Get appropriate grid class based on number of items
  const getGridColsClass = (count: number) => {
    switch (count) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      default:
        return 'grid-cols-5';
    }
  };

  // Check if the current path matches a menu item's href
  const isActive = (href: string, exact = false) => {
    if (href === '#') return false;
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className='md:hidden'>
      <div className='pb-safe fixed bottom-0 left-0 z-40 w-full border-t border-gray-200 bg-white shadow-lg'>
        <div className={`grid h-16 ${getGridColsClass(visibleMenuItems.length)}`}>
          {visibleMenuItems.map((item) => {
            const active = isActive(item.href, item?.exact);
            return (
              <Link
                key={item.name}
                href={item.disabled ? '#' : item.href}
                className={cn(
                  'relative flex h-full w-full items-center justify-center transition-colors duration-200',
                  item.disabled && 'cursor-default opacity-70',
                )}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <div
                  className={cn(
                    'flex h-full w-full flex-col items-center justify-center gap-1',
                    active ? 'bg-functional-link-primary' : 'hover:bg-gray-100',
                  )}
                >
                  <item.icon className={cn('h-5 w-5', active ? 'text-white' : 'text-gray-600')} />
                  <span className={cn('text-xs', active ? 'text-white' : 'text-gray-600')}>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
