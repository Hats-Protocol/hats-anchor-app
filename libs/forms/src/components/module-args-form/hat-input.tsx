'use client';

import { useTreeForm } from 'contexts';
import { find, map } from 'lodash';
import { ChangeEvent, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { idToIp } from 'shared';
import { AppHat } from 'types';
import { transformAndVerify } from 'utils';

import { Input } from '../input';
import { Select } from '../select';

// TODO add back custom option

const HatInput = ({ arg, localForm }: { arg: any; localForm: UseFormReturn }) => {
  const { setValue } = localForm;
  const { treeToDisplay } = useTreeForm();
  const [customHatSelections, setCustomHatSelections] = useState<{
    [key: string]: boolean;
  }>({});

  const hatOptions = map(treeToDisplay, ({ id, detailsObject }: AppHat) => {
    const currentName = find(treeToDisplay, ['id', id])?.displayName;
    const detailsName = currentName || detailsObject?.data?.name;

    return {
      label: `${detailsName ? `${detailsName} - ` : ''}${idToIp(id)}`,
      value: id,
    };
  });

  const handleChangeHat = (e: ChangeEvent<HTMLSelectElement>, argName: string) => {
    setCustomHatSelections((prevState) => {
      const newState = { ...prevState } as { [key: string]: boolean };

      if (e.target.value === 'custom') {
        newState[argName] = true;
      } else {
        newState[argName] = false;
        setValue(`${argName}_custom`, undefined, {
          shouldDirty: true,
        });
      }

      return newState;
    });
  };

  return (
    <div className='flex w-full flex-col gap-1'>
      <Select
        name={arg.name}
        label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
        subLabel={arg.description}
        localForm={localForm}
        placeholder='Select a hat'
        defaultValue={undefined}
        formOptions={{
          required: !arg.optional,
          validate: (value) => String(value) === 'custom' || transformAndVerify(value, arg.type),
        }}
        options={hatOptions}
        // onChange={(e) => handleChangeHat(e, arg.name)}
      />

      {customHatSelections[arg.name] && (
        <Input
          name={`${arg.name}_custom`}
          label='Custom Hat ID'
          placeholder='e.g. 285.1.3'
          localForm={localForm}
          options={{
            required: !arg.optional,
            // TODO validation - check if the hat exists
          }}
        />
      )}
    </div>
  );
};

export { HatInput };
