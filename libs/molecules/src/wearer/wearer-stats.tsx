'use client';

import { useControllerList, useHatsAdminOf, useWearerDetails } from 'hats-hooks';
import { filter, get, map, size, subtract, toLower } from 'lodash';
import { usePathname } from 'next/navigation';
import { Skeleton } from 'ui';
import { cn } from 'ui';
import { Card } from 'ui';
import { Hex } from 'viem';
type HeadlineStat = {
  label: string;
  value: number;
  loading: boolean;
};

const WearerStats = () => {
  const pathname = usePathname();
  const parsedPathname = pathname.split('/');
  const wearerAddress = get(parsedPathname, subtract(size(parsedPathname), 1)) as Hex;

  const { data: currentHats, isLoading: currentHatsLoading } = useWearerDetails({
    wearerAddress,
    chainId: 'all',
  });

  const { data: controllerHats, isLoading: controllerHatsLoading } = useControllerList({
    address: wearerAddress,
  });
  const { data: adminOfHats, isLoading: adminOfHatsLoading } = useHatsAdminOf({
    hats: currentHats,
  });

  const headlineStats = [
    {
      label: 'Wearer of',
      value: size(currentHats),
      loading: currentHatsLoading,
    },
    {
      label: 'Admin of',
      value: size(adminOfHats),
      loading: adminOfHatsLoading,
    },
    {
      label: 'Eligibility for',
      value: size(filter(controllerHats, ['eligibility', toLower(wearerAddress)])),
      loading: controllerHatsLoading,
    },
    {
      label: 'Toggle for',
      value: size(filter(controllerHats, ['toggle', toLower(wearerAddress)])),
      loading: controllerHatsLoading,
    },
  ];

  return (
    <div className='flex h-28 flex-wrap justify-center gap-2'>
      {map(headlineStats, (stat: HeadlineStat) => {
        if (stat.loading) {
          return <Skeleton className='w-1/4 px-0 py-2 md:w-[135px] md:px-6 md:py-4' />;
        }

        return (
          <Card className={cn('w-1/4 px-0 py-2 md:w-[135px] md:px-6 md:py-4')} key={stat.label}>
            <div className='flex h-full flex-col items-center justify-around'>
              <p className='text-xs md:text-sm'>{stat.label}</p>

              <h3 className='text-xl font-semibold md:text-2xl'>{stat.value}</h3>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export { WearerStats };
