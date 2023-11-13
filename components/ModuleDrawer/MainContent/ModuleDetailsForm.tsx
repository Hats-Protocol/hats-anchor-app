import { Icon, Stack, Text } from '@chakra-ui/react';
import { Module } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsPuzzle, BsTextLeft } from 'react-icons/bs';
import { isAddress } from 'viem';

import DatePicker from '@/components/atoms/DatePicker';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import FormRowWrapper from '@/components/FormRowWrapper';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatsModules from '@/hooks/useHatsModules';
import { transformAndVerify } from '@/lib/general';
import { decimalId, prettyIdToIp } from '@/lib/hats';
import { ModuleCreationArg, ModuleDetails } from '@/types';

const ModuleDetailsForm = ({
  localForm,
  title,
  selectedModuleDetails,
  setSelectedModuleDetails,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  title: string;
  selectedModuleDetails: ModuleDetails | undefined;
  setSelectedModuleDetails: Dispatch<SetStateAction<ModuleDetails | undefined>>;
}) => {
  const { onchainHats, treeToDisplay } = useTreeForm();
  const { modules } = useHatsModules();
  const { watch } = localForm;
  const selectedModuleType = watch('moduleType', '');

  const [selectedModuleArgs, setSelectedModuleArgs] = useState<
    ModuleCreationArg[] | null
  >([]);

  const modulesToDisplay: ModuleDetails[] = useMemo(() => {
    const modulesForType: Module[] = _.filter(modules, [
      'type',
      _.toLower(title),
    ]);
    return _.map(modulesForType, (value: Module, key: string) => ({
      id: key,
      ...value,
    })) as unknown as ModuleDetails[]; // thinks boolean[] ?
  }, [modules, title]);

  const selectedModule = useMemo(() => {
    return _.find(modulesToDisplay, ['id', selectedModuleType]);
  }, [modulesToDisplay, selectedModuleType]);

  useEffect(() => {
    setSelectedModuleDetails?.(selectedModule || undefined);
    setSelectedModuleArgs(
      (selectedModule?.creationArgs && [
        ...selectedModule.creationArgs.immutable,
        ...selectedModule.creationArgs.mutable,
      ]) ||
        null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule]);

  if (!onchainHats || !treeToDisplay) return null;

  return (
    <Stack spacing={12}>
      <FormRowWrapper>
        <Icon as={BsPuzzle} boxSize={4} mt='2px' />
        <Select
          label='Module Type'
          subLabel='The category of prewritten module to connect to this hat.'
          name='moduleType'
          defaultValue={undefined}
          placeholder='Select a module type'
          localForm={localForm}
        >
          {_.map(modulesToDisplay, ({ name, id }) => (
            <option value={id} key={name}>
              {name}
            </option>
          ))}
        </Select>
      </FormRowWrapper>
      {selectedModuleDetails && (
        <FormRowWrapper>
          <Icon as={BsTextLeft} boxSize={4} mt='2px' />
          <Stack spacing={3}>
            <Text fontSize='sm' fontWeight='medium'>
              MODULE TYPE DETAILS
            </Text>
            {selectedModuleDetails.details.map((detail: string) => (
              <Text key={detail}>{detail}</Text>
            ))}
          </Stack>
        </FormRowWrapper>
      )}
      {selectedModuleArgs?.map((arg: ModuleCreationArg) => (
        <FormRowWrapper key={arg.name}>
          <Icon as={BsTextLeft} boxSize={4} mt={1} />
          {(arg.displayType === 'default' ||
            arg.displayType === 'token' ||
            arg.displayType === 'jokerace') && (
            <Input
              name={arg.name}
              label={arg.name}
              subLabel={arg.description}
              placeholder={
                Array.isArray(arg.example)
                  ? (arg.example as string[]).join(', ')
                  : (arg.example as string)
              }
              options={{
                required: true,
                validate: (value) => {
                  if (
                    ['token', 'jokerace'].includes(arg.displayType) &&
                    !isAddress(value)
                  ) {
                    return 'Invalid address';
                  }

                  return transformAndVerify(value, arg.type);
                },
              }}
              localForm={localForm}
            />
          )}
          {arg.displayType === 'hat' && (
            <Select
              name={arg.name}
              label={arg.name}
              subLabel={arg.description}
              localForm={localForm}
              placeholder='Select a hat'
              defaultValue={undefined}
              options={{
                required: true,
                validate: (value) => transformAndVerify(value, arg.type),
              }}
            >
              {_.map(onchainHats, ({ id, prettyId }) => (
                <option value={decimalId(id)} key={id}>
                  {prettyIdToIp(prettyId)}
                </option>
              ))}
            </Select>
          )}
          {arg.displayType === 'timestamp' && (
            <DatePicker
              name={arg.name}
              label={arg.name}
              subLabel={arg.description}
              localForm={localForm}
            />
          )}
          {(arg.displayType === 'seconds' ||
            arg.displayType === 'amountWithDecimals') && (
            <Input
              name={arg.name}
              label={arg.name}
              type='number'
              subLabel={arg.description}
              placeholder={
                Array.isArray(arg.example)
                  ? (arg.example as string[]).join(', ')
                  : (arg.example as string)
              }
              options={{
                required: true,
                validate: (value) => transformAndVerify(value, arg.type),
              }}
              localForm={localForm}
            />
          )}
        </FormRowWrapper>
      ))}
    </Stack>
  );
};

export default ModuleDetailsForm;
