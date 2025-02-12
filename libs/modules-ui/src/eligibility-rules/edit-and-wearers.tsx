'use client';

import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useHatAdminWearers, useHatDetails } from 'hats-hooks';
import { getControllerNameAndLink } from 'hats-utils';
import { useMediaStyles } from 'hooks';
import { filter, first, get, includes, map, reject, size } from 'lodash';
import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { IconType } from 'react-icons';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';
import { AppHat, HatWearer, SupportedChains } from 'types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, cn, Link, Skeleton } from 'ui';
import { explorerUrl, formatAddress } from 'utils';
import { Hex } from 'viem';

const CodeIcon = dynamic(() => import('icons').then((i) => i.CodeIcon));
const WearerIcon = dynamic(() => import('icons').then((i) => i.WearerIcon));
const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));
const GroupIcon = dynamic(() => import('icons').then((i) => i.GroupIcon));

const AdminHatRow = ({ hatId }: { hatId: Hex }) => {
  const { chainId, orgChartWearers } = useTreeForm();

  const { data: hat, details } = useHatDetails({ hatId, chainId });

  const wearers = filter(orgChartWearers, (w: HatWearer) =>
    includes(map(get(hat, 'wearers'), 'id'), w.id),
  ) as HatWearer[];

  const contractWearers = filter(wearers, 'isContract');
  const safeWearers = filter(contractWearers, (w: HatWearer) => w?.contractName?.includes('GnosisSafeProxy'));
  const wearerCount = {
    code: size(contractWearers) - size(safeWearers) || 0,
    groups: size(safeWearers) || 0,
    human: size(reject(wearers, 'isContract')) || 0,
  };

  if (!chainId || !hat || size(wearers) === 0) return null;

  return (
    <div className='flex justify-between py-1 md:text-base'>
      <div className='flex items-center gap-2'>
        <HatIcon className='size-4' />

        <p>
          {hatIdDecimalToIp(hatIdHexToDecimal(hatId))} {details?.name}
        </p>
      </div>

      <div>
        <WearerBreakdown wearers={wearers} wearerCount={wearerCount} chainId={chainId} />
      </div>
    </div>
  );
};

const AdminWearersPanel = () => {
  const { treeToDisplay, orgChartWearers } = useTreeForm();
  const { selectedHat, chainId, isClaimable, hatLoading: selectedHatLoading } = useSelectedHat();
  const { isMobile } = useMediaStyles();
  const [open, setOpen] = useState('');
  // const isMounted = useRef(false);
  const expanded = open === 'admins';
  const handleToggle = useCallback((value: string) => {
    setOpen(value);
  }, []);

  const {
    data: admins,
    adminCount,
    adminHats,
    isLoading: adminWearersLoading,
  } = useHatAdminWearers({
    selectedHat,
    treeToDisplay,
    orgChartWearers,
    chainId,
  });

  if (size(adminHats) === 0 || selectedHatLoading) {
    return <Skeleton className='mx-4 my-2' />;
  }

  if (size(admins) === 1) {
    return (
      <div className='flex justify-between px-4 py-1'>
        <p>
          <span className='hidden md:inline'>Admins can edit this Hat</span>
          <span className='inline md:hidden'>Can edit Hat</span>
          {!isClaimable?.for ? ' and choose Wearers' : ''}
        </p>

        <WearerBreakdown wearers={admins} wearerCount={adminCount} chainId={chainId} />
      </div>
    );
  }

  // TODO move background gradient to theme

  return (
    <Accordion type='single' collapsible value={open} onValueChange={handleToggle}>
      <AccordionItem className={cn('w-full rounded-md border-none', expanded && 'shadow')} value='admins'>
        <AccordionTrigger
          className={cn(
            'border-gray border-t-md border-t-gray overflow-visible rounded-md border-b border-b-transparent p-0 px-4 hover:bg-white hover:no-underline',
            !expanded ? 'hover:border-b hover:border-blue-300' : 'hover:border-t-gray-100',
            expanded && 'bg-gradient-accordion-trigger rounded-b-none border-b-gray-400',
          )}
        >
          <div className={cn('flex w-full justify-between py-2 pr-4 text-base font-light', expanded && 'font-normal')}>
            <p>
              Admins can edit {!isMobile ? 'this Hat' : ''}
              {!isClaimable?.for ? ' and choose Wearers' : ''}
            </p>

            <WearerBreakdown wearers={admins} wearerCount={adminCount} chainId={chainId} />
          </div>
        </AccordionTrigger>

        <AccordionContent className='border-b-lg border-gray overflow-visible rounded-b-md bg-white p-0 pb-1'>
          <div className='space-y-2 px-4 py-2'>
            {adminWearersLoading ? (
              <>
                <Skeleton className='mx-4 my-2 md:mx-0' key='skeleton-1' />
                <Skeleton className='mx-4 my-2 md:mx-0' key='skeleton-2' />
              </>
            ) : (
              map(adminHats, (adminHat: AppHat) => <AdminHatRow key={adminHat.id} hatId={adminHat.id} />)
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const WearerBreakdown = ({
  wearers,
  wearerCount,
  chainId,
}: {
  wearers: HatWearer[] | undefined;
  wearerCount: { code: number; groups: number; human: number };
  chainId: SupportedChains | undefined;
}) => {
  const wearer = first(wearers);

  if (!wearers) return null;
  const { name, link, icon } = getControllerNameAndLink({
    extendedController: wearer,
    chainId,
  });

  const Icon = icon ?? ((wearer?.isContract ? CodeIcon : WearerIcon) as IconType);

  if (size(wearers) === 1) {
    return (
      <Link href={link}>
        <div
          className={cn(
            'flex items-center gap-1',
            // TODO include "not name.includes('Safe')" when wearer count is updated
            wearer?.isContract ? 'text-informative-code' : 'text-informative-human',
          )}
        >
          <p>{name || formatAddress(wearer?.id)}</p>

          <Icon className='h-4 w-4' />
        </div>
      </Link>
    );
  }

  return (
    <div className='flex items-center gap-1'>
      {wearerCount.code > 0 && (
        <div className='text-informative-code flex items-center gap-1'>
          <p>{wearerCount.code}×</p>
          <CodeIcon className='h-4 w-4' />
        </div>
      )}
      {wearerCount.groups > 0 && (
        <div className='text-informative-human flex items-center gap-1'>
          <p>{wearerCount.groups}×</p>
          <GroupIcon className='h-4 w-4' />
        </div>
      )}
      {wearerCount.human > 0 && (
        <div className='text-informative-human flex items-center gap-1'>
          <p>{wearerCount.human}×</p>
          <WearerIcon className='h-4 w-4' />
        </div>
      )}
    </div>
  );
};

const Claimable = ({
  address,
  chainId,
  claimFor,
}: {
  address: Hex | undefined;
  chainId: number | undefined;
  claimFor: boolean;
}) => {
  if (!address || !chainId) return null;

  return (
    <Link href={`${explorerUrl(chainId)}/address/${address}`} isExternal>
      <div className='text-functional-link-primary flex items-center gap-1'>
        <p>{claimFor ? 'Free Claim' : 'Self Claim'}</p>
        <CodeIcon className='h-4 w-4' />
      </div>
    </Link>
  );
};

export const EditAndWearers = () => {
  const { treeToDisplay, orgChartWearers, isLoading: treeLoading } = useTreeForm();
  const { selectedHat, chainId, isClaimable } = useSelectedHat();

  const {
    data: admins,
    adminCount,
    isLoading: adminWearersLoading,
  } = useHatAdminWearers({
    selectedHat,
    treeToDisplay,
    orgChartWearers,
    chainId,
  });

  const claimableAddress = get(first(get(selectedHat, 'claimableBy')), 'id') as Hex | undefined;
  const claimableForAddress = get(first(get(selectedHat, 'claimableForBy')), 'id') as Hex | undefined;

  // const canAddWearers = useBreakpointValue({
  //   base: 'Anyone can add eligible Wearers',
  //   md: 'Anyone can add eligible addresses as Wearers',
  // });

  if (treeLoading || adminWearersLoading) {
    return (
      <div className='flex flex-col gap-2 px-4 md:px-12'>
        <Skeleton className='h-4 w-full md:mx-4' />
      </div>
    );
  }

  if (!selectedHat?.mutable) {
    return (
      <div className='space-y-2 px-4 py-1 md:px-0'>
        <div className='flex justify-between'>
          <p>This Hat cannot be edited</p>

          <div className='flex items-center gap-1'>
            <p>Immutable</p>
            <IoEllipsisVerticalSharp className='h-4 w-4' />
          </div>
        </div>

        <div className='flex justify-between'>
          <p>Admins can add Wearers</p>

          <WearerBreakdown wearers={admins} wearerCount={adminCount} chainId={chainId} />
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-1 px-4 py-1 md:px-0'>
      <AdminWearersPanel />

      {(isClaimable?.for || isClaimable?.by) &&
        (isClaimable?.for ? (
          <div className='flex justify-between px-4 py-2'>
            <p>Anyone can add eligible Wearers</p>

            <Claimable address={claimableForAddress} chainId={chainId} claimFor={isClaimable.for} />
          </div>
        ) : (
          <div className='flex justify-between px-4 py-2'>
            <p>Eligible addresses can claim a Hat</p>

            <Claimable address={claimableAddress} chainId={chainId} claimFor={isClaimable.for} />
          </div>
        ))}
    </div>
  );
};
