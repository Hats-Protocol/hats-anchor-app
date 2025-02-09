'use client';

import { CONTACT_URL } from '@hatsprotocol/config';
import { TOKEN_ARG_TYPES } from '@hatsprotocol/constants';
import { useTreeForm } from 'contexts';
import { FormRowWrapper, ModuleArgsForm, Select } from 'forms';
import { filter, find, get, includes, keys, map, pickBy, toLower } from 'lodash';
import { useHatsModules } from 'modules-hooks';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsPuzzle, BsTextLeft } from 'react-icons/bs';
import { ModuleDetails } from 'types';
import { Link } from 'ui';

const ModuleDetailsForm = ({
  localForm,
  title,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  title: string;
}) => {
  const { onchainTree, treeToDisplay, chainId, editMode } = useTreeForm();
  const { modules } = useHatsModules({ chainId, editMode });
  const { watch } = localForm;
  const selectedModuleField = watch('moduleType', '');
  const modulesToDisplay: ModuleDetails[] = useMemo(() => {
    const modulesForType = filter(modules, (m: ModuleDetails) => {
      const types = keys(pickBy(m.type, (value: ModuleDetails) => value));

      return includes(types, toLower(title));
    });

    return modulesForType;
  }, [modules, title]);

  const selectedModule = useMemo(() => {
    return find(modulesToDisplay, { id: selectedModuleField });
  }, [modulesToDisplay, selectedModuleField]);
  const selectedModuleDetails = useMemo(() => {
    return find(modules, { id: selectedModuleField });
  }, [modules, selectedModuleField]);
  const selectedModuleArgs = useMemo(() => {
    return (
      (selectedModule?.creationArgs && [
        ...selectedModule.creationArgs.immutable,
        ...selectedModule.creationArgs.mutable,
      ]) ||
      null
    );
  }, [selectedModule]);

  const tokenArgName = get(
    find(selectedModuleArgs, (a) => includes(TOKEN_ARG_TYPES, a.displayType)),
    'name',
  );
  // watch() by default returns whole object, so not good fallback
  const tokenAddress = tokenArgName ? watch(tokenArgName) : undefined;

  if (!onchainTree || !treeToDisplay) return null;

  return (
    <div className='mx-8 mt-4 space-y-12'>
      <FormRowWrapper noMargin>
        <BsPuzzle className='absolute -ml-8 mt-1 size-4' />
        <div className='w-full space-y-2'>
          <Select
            label='Module Type'
            subLabel='The category of prewritten module to connect to this hat.'
            name='moduleType'
            defaultValue={undefined}
            placeholder='Select a module type'
            localForm={localForm}
          >
            {map(modulesToDisplay, ({ name, id }) => (
              <option value={id} key={name}>
                {name}
              </option>
            ))}
          </Select>

          <div className='flex items-center gap-2'>
            <p className='text-sm text-gray-500'>Not finding a module you&apos;re looking for?</p>
            <Link href={CONTACT_URL} className='text-functional-link-primary text-sm underline' isExternal>
              Let us know here
            </Link>
          </div>
        </div>
      </FormRowWrapper>

      {selectedModuleDetails && (
        <FormRowWrapper noMargin>
          <BsTextLeft className='absolute -ml-8 mt-1 size-4' />

          <div className='space-y-3'>
            <p className='text-sm font-medium'>MODULE TYPE DETAILS</p>
            {selectedModuleDetails.details.map((detail: string) => (
              <p key={detail}>{detail}</p>
            ))}
          </div>
        </FormRowWrapper>
      )}

      <div className='space-y-6'>
        <ModuleArgsForm
          selectedModuleArgs={selectedModuleArgs || undefined}
          localForm={localForm}
          tokenAddress={tokenAddress}
        />
      </div>
    </div>
  );
};

export { ModuleDetailsForm };
