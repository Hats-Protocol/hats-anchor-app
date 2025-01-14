'use client';

import { Button } from '@chakra-ui/react';
import { UseFormReturn } from 'react-hook-form';

import { Input } from '../components';

// const ELIGIBILITY_MODULE_TYPE = 'meta';

const ModuleDetailsForm = ({
  localForm,
  removeModule,
  field,
  index,
}: {
  localForm: UseFormReturn<any>;
  removeModule: (index: number) => void;
  field: any;
  index: number;
}) => {
  // TODO the current form doesn't handle being a part of a field array well
  // const { watch } = localForm;
  // const { modules } = useHatsModules({ chainId: CHAIN_ID });
  // const moduleType = watch(`modules.${index}.type`);
  // const modulesToDisplay: ModuleDetails[] = useMemo(() => {
  //   const modulesForType = filter(modules, (m: ModuleDetails) => {
  //     const types = keys(pickBy(m.type, (value: ModuleDetails) => value));

  //     return includes(types, toLower(ELIGIBILITY_MODULE_TYPE));
  //   });

  //   return modulesForType;
  // }, [modules]);

  // const selectedModule = useMemo(() => {
  //   return find(modulesToDisplay, { id: moduleType });
  // }, [modulesToDisplay, moduleType]);
  // // const selectedModuleDetails = useMemo(() => {
  // //   return find(modules, { id: moduleType });
  // // }, [modules, moduleType]);
  // const selectedModuleArgs = useMemo(() => {
  //   return (
  //     (selectedModule?.creationArgs && [
  //       ...selectedModule.creationArgs.immutable,
  //       ...selectedModule.creationArgs.mutable,
  //     ]) ||
  //     null
  //   );
  // }, [selectedModule]);

  // const tokenArgName = get(
  //   find(selectedModuleArgs, (a) => includes(TOKEN_ARG_TYPES, a.displayType)),
  //   'name',
  // );
  // // watch() by default returns whole object, so not good fallback
  // const tokenAddress = tokenArgName ? watch(tokenArgName) : undefined;

  return (
    <div key={field.id} className='flex flex-col gap-4 rounded border bg-slate-100 p-8'>
      <Input
        name={`modules.${index}.address`}
        label='Module Address'
        placeholder='0x...'
        localForm={localForm}
        options={{ required: true }}
      />

      <div className='flex justify-end'>
        <Button onClick={() => removeModule(index)} size='xs' variant='outline'>
          Remove
        </Button>
      </div>
    </div>
  );
};

export default ModuleDetailsForm;
