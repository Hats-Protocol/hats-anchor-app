'use client';

import { useTreeForm } from 'contexts';
import { Form, Input } from 'forms';
import { useAllWearers } from 'hats-hooks';
import { capitalize, filter, includes, isEmpty, map, pick, size, toString } from 'lodash';
import { UseFormReturn } from 'react-hook-form';
import { AiOutlineFilter } from 'react-icons/ai';
import { BsChevronDown } from 'react-icons/bs';
import { AllowlistProfile, AppHat } from 'types';
import { Button, Popover, PopoverContent, PopoverTrigger } from 'ui';
import { filterProfiles } from 'utils';

import { EligibilityRow } from './eligibility-row';
import { FILTER, Filter } from './types';

export const ProfileList = ({
  hat,
  heading,
  profiles,
  activeFilter,
  setActiveFilter,
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
        <h2 className='text-2xl font-bold'>{heading}</h2>

        <div className='flex w-full flex-col items-center gap-4'>
          <Input name='search' placeholder='Find by address (0x) or ENS (.eth)' localForm={localForm} />

          <Popover>
            <PopoverTrigger>
              <Button size='sm' variant='outline-blue'>
                <AiOutlineFilter />
                {capitalize(activeFilter)} ({size(filteredProfiles[activeFilter])})
                <BsChevronDown />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div>
                <div onClick={() => setActiveFilter(FILTER.WEARER)}>Wearer ({size(filteredProfiles.wearer)})</div>
                <div onClick={() => setActiveFilter(FILTER.ELIGIBLE)}>Eligible ({size(filteredProfiles.eligible)})</div>
                <div onClick={() => setActiveFilter(FILTER.INELIGIBLE)}>
                  Ineligible ({size(filteredProfiles.ineligible)})
                </div>
                <div onClick={() => setActiveFilter(FILTER.ALL)}>All ({size(filteredProfiles.all)})</div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className='flex h-full w-full flex-col items-center gap-4'>
          <div className='flex flex-col items-center gap-1'>
            <div className='flex justify-between'>
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
  activeFilter: Filter;
  setActiveFilter: (filter: Filter) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  handleUpdateListAdd: (account: `0x${string}`) => void;
  handleUpdateListRemove: (account: `0x${string}`) => void;
  updating: boolean;
  updateList: AllowlistProfile[];
}
