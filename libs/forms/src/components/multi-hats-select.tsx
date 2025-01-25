'use client';

import { compact, concat, get, isEmpty, map, sortBy } from 'lodash';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';
import Select from 'react-select';
import { idToIp } from 'shared';
import { AppHat } from 'types';
import { Tooltip } from 'ui';
import { Hex } from 'viem';

import { Input } from './input';

const MultiHatsSelect = ({
  name,
  label,
  subLabel,
  hatOptions,
  options,
  placeholder,
  info,
  localForm,
  allowMultiple = false,
  includeCustomOption = true,
}: MultiHatsSelectProps) => {
  const { watch, setValue } = localForm;

  const useCustomHat = watch(name)?.value === 'custom';

  if (!hatOptions || isEmpty(hatOptions)) return null;

  const localHatOptions = compact(
    concat(
      includeCustomOption ? { label: 'Custom', value: 'custom' } : [],
      map(sortBy(hatOptions, 'id'), (h: AppHat) => {
        const detailsName = get(h, 'detailsObject.data.name');
        return {
          label: `${idToIp(h.id as Hex)} ${detailsName}`,
          value: h.id,
        };
      }),
    ),
  );

  return (
    <div className='flex flex-col gap-2'>
      {label && (
        <div className='flex items-center gap-1'>
          <p className='mb-0 text-sm uppercase'>{label}</p>

          {info && (
            <Tooltip label={info}>
              <FaRegQuestionCircle />
            </Tooltip>
          )}
        </div>
      )}
      {typeof subLabel !== 'string' ? subLabel : <p className='text-blackAlpha-700 mt-0 text-sm'>{subLabel}</p>}
      <Select
        name={name}
        value={watch(name)}
        options={localHatOptions}
        placeholder={placeholder || (allowMultiple ? 'Choose hats' : 'Choose a hat')}
        onChange={(e) => {
          setValue(name, e);
        }}
        isMulti={allowMultiple}
      />

      {useCustomHat && (
        <div className='pt-2'>
          <Input
            name={`${name}-custom`}
            label='Custom Hat'
            placeholder='0x0000012300010001000...'
            localForm={localForm}
          />
        </div>
      )}
    </div>
  );
};

interface MultiHatsSelectProps {
  name: string;
  label: string;
  subLabel?: string;
  hatOptions: AppHat[] | undefined;
  options?: RegisterOptions;
  placeholder?: string;
  info?: string;
  localForm: UseFormReturn;
  allowMultiple?: boolean;
  includeCustomOption?: boolean;
}

export { MultiHatsSelect, type MultiHatsSelectProps };
