'use client';

import { FALLBACK_ARG_EXAMPLES, MODULE_ARG_BOOLEAN_OPTION_SETS } from '@hatsprotocol/constants';
import { ModuleCreationArg } from '@hatsprotocol/modules-sdk';
import { first, map, toLower } from 'lodash';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from 'ui';

const BooleanInput = ({ arg, localForm }: { arg: ModuleCreationArg; localForm: UseFormReturn }) => {
  const booleanOptions =
    MODULE_ARG_BOOLEAN_OPTION_SETS[toLower(arg.name) as keyof typeof MODULE_ARG_BOOLEAN_OPTION_SETS] ||
    FALLBACK_ARG_EXAMPLES.booleanOption;

  useEffect(() => {
    // set default value(s)
    if (arg.type === 'bool') setValue(arg.name, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { setValue } = localForm;

  return (
    <div className='flex flex-col gap-1'>
      <div className='flex flex-col items-start gap-1'>
        <div className='flex'>
          <p className='text-sm text-gray-500'>{arg.name}</p>
        </div>
        <p className='text-sm text-gray-500'>{arg.description}</p>
      </div>

      <RadioGroup name={arg.name} defaultValue={first(booleanOptions)} onChange={(value) => setValue(arg.name, value)}>
        <div className='flex gap-4'>
          {map(booleanOptions, (option: any) => (
            <RadioGroupItem value={option} key={option}>
              {option}
            </RadioGroupItem>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export { BooleanInput };
