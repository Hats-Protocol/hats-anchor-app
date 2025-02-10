'use client';

import { useTreeForm } from 'contexts';
import { Form, Input } from 'forms';
import { useAllWearers } from 'hats-hooks';
import { capitalize, filter, includes, isEmpty, map, pick, size, toString } from 'lodash';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AiOutlineFilter } from 'react-icons/ai';
import { BsChevronDown } from 'react-icons/bs';
import { AllowlistProfile, AppHat } from 'types';
import { Button, cn, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from 'ui';
import { filterProfiles } from 'utils';

import { EligibilityRow } from './eligibility-row';
import { FILTER, Filter } from './types';

type FilteredProfiles = {
  wearers: AllowlistProfile[];
  eligible: AllowlistProfile[];
  ineligible: AllowlistProfile[];
  all: AllowlistProfile[];
};

const getDefaultFilter = (profiles: FilteredProfiles) => {
  if (size(profiles.wearers) > 0) return FILTER.WEARER;
  if (size(profiles.eligible) > 0) return FILTER.ELIGIBLE;
  if (size(profiles.ineligible) > 0) return FILTER.INELIGIBLE;
  return FILTER.ALL;
};

export const ProfileList = ({
  hat,
  heading,
  profiles,
  localForm,
  handleUpdateListAdd,
  handleUpdateListRemove,
  updating,
  updateList,
}: ProfileListProps) => {
  const { chainId } = useTreeForm();
  const { wearers } = useAllWearers({ selectedHat: hat, chainId });
  const filteredProfiles = filterProfiles({
    profiles,
    wearerIds: map(wearers, (wearer) => wearer.id),
  });
  const [activeFilter, setActiveFilter] = useState<Filter>(getDefaultFilter(filteredProfiles));
  const { watch } = pick(localForm, ['watch']);

  const searchInput = watch('search');

  const currentFilteredProfiles = filter(
    filteredProfiles[activeFilter],
    (p: AllowlistProfile) =>
      !searchInput || includes(toString(p.id), searchInput) || includes(toString(p.ensName), searchInput),
  );

  return (
    <Form {...localForm}>
      <div className='flex h-full w-full flex-col items-center gap-4'>
        <h2 className='text-xl font-bold'>{heading}</h2>

        <div className='flex w-full items-center justify-between gap-4'>
          <div className='w-2/3'>
            <Input name='search' placeholder='Find by address (0x) or ENS (.eth)' localForm={localForm} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size='sm' variant='outline'>
                <AiOutlineFilter />
                {capitalize(activeFilter)} ({size(filteredProfiles[activeFilter])})
                <BsChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {map([FILTER.WEARER, FILTER.ELIGIBLE, FILTER.INELIGIBLE, FILTER.ALL], (filter) => (
                <DropdownMenuItem
                  onClick={() => setActiveFilter(filter)}
                  className={cn('flex justify-between', activeFilter === filter && 'bg-functional-link-primary/20')}
                  disabled={filter === activeFilter || size(filteredProfiles[filter]) === 0}
                >
                  <p>{capitalize(filter)}</p>
                  <p>{size(filteredProfiles[filter])}</p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='flex h-full w-full flex-col items-center gap-4'>
          <div className='flex w-full flex-col items-center gap-1'>
            <div className='flex w-full justify-between'>
              <p className='text-sm'>Address</p>
              <p className='text-sm'>Status</p>
            </div>

            <hr className='border-black' />
          </div>

          {map(currentFilteredProfiles, (p: AllowlistProfile) => (
            <EligibilityRow
              key={p.id}
              eligibilityAccount={p}
              wearers={wearers}
              updating={updating}
              updateList={updateList}
              handleAdd={handleUpdateListAdd}
              handleRemove={handleUpdateListRemove}
            />
          ))}
          {isEmpty(currentFilteredProfiles) && (
            <div className='h-100px flex w-full items-center justify-center'>
              <p className='text-gray-500'>No addresses found</p>
            </div>
          )}
        </div>
      </div>
    </Form>
  );
};

interface ProfileListProps {
  heading?: string;
  hat: AppHat | undefined;
  profiles: AllowlistProfile[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  handleUpdateListAdd: (account: `0x${string}`) => void;
  handleUpdateListRemove: (account: `0x${string}`) => void;
  updating: boolean;
  updateList: AllowlistProfile[];
}
