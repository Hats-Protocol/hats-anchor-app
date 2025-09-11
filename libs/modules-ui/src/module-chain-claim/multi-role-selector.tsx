'use client';

import { map } from 'lodash';
import { useEffect, useState } from 'react';
import { AppHat } from 'types';
import { BaseSelect, BaseSelectContent, BaseSelectItem, BaseSelectTrigger, BaseSelectValue } from 'ui';
import { parseDetailsObject } from 'utils';
import { Hex } from 'viem';

interface MultiRoleSelectorProps {
  signerHats: AppHat[];
  onRoleSelect: (hatId: Hex) => void;
  selectedHatId?: Hex;
}

export const MultiRoleSelector = ({ signerHats, onRoleSelect, selectedHatId }: MultiRoleSelectorProps) => {
  const localSignerHats = map(signerHats, parseDetailsObject);
  const defaultHatId = selectedHatId || (localSignerHats[0]?.id as Hex);
  const [selectedRole, setSelectedRole] = useState<Hex | undefined>(defaultHatId);

  useEffect(() => {
    if (defaultHatId && !selectedHatId) {
      onRoleSelect(defaultHatId);
    }
  }, [defaultHatId, selectedHatId, onRoleSelect]);

  const handleRoleSelect = (hatId: string) => {
    setSelectedRole(hatId as Hex);
    onRoleSelect(hatId as Hex);
  };

  if (!localSignerHats || localSignerHats.length <= 1) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <p className='text-xl font-bold md:text-2xl'>Claim one of {localSignerHats.length} roles to join the Council</p>
      <div className='flex items-center gap-4'>
        <div className='w-1/3'>
          <BaseSelect value={selectedRole || ''} onValueChange={handleRoleSelect}>
            <BaseSelectTrigger className='w-full'>
              <BaseSelectValue placeholder='Select a role to join as...' />
            </BaseSelectTrigger>
            <BaseSelectContent>
              {localSignerHats.map((hat) => {
                if (!hat) return null;
                return (
                  <BaseSelectItem key={hat.id} value={hat.id as string}>
                    <div className='flex items-center gap-3'>
                      <span className='font-medium'>{hat.detailsObject?.data?.name || 'Council Role'}</span>
                    </div>
                  </BaseSelectItem>
                );
              })}
            </BaseSelectContent>
          </BaseSelect>
        </div>
      </div>
    </div>
  );
};
