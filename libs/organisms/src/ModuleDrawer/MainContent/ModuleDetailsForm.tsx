'use client';

import { Box, Icon, Stack, Text } from '@chakra-ui/react';
import { CONTACT_URL, TOKEN_ARG_TYPES } from '@hatsprotocol/constants';
import { useTreeForm } from 'contexts';
import { FormRowWrapper, ModuleArgsForm, Select } from 'forms';
import _ from 'lodash';
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
    const modulesForType = _.filter(modules, (m: ModuleDetails) => {
      const types = _.keys(_.pickBy(m.type, (value: ModuleDetails) => value));

      return _.includes(types, _.toLower(title));
    });

    return modulesForType;
  }, [modules, title]);

  const selectedModule = useMemo(() => {
    return _.find(modulesToDisplay, { id: selectedModuleField });
  }, [modulesToDisplay, selectedModuleField]);
  const selectedModuleDetails = useMemo(() => {
    return _.find(modules, { id: selectedModuleField });
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

  const tokenArgName = _.get(
    _.find(selectedModuleArgs, (a) => _.includes(TOKEN_ARG_TYPES, a.displayType)),
    'name',
  );
  // watch() by default returns whole object, so not good fallback
  const tokenAddress = tokenArgName ? watch(tokenArgName) : undefined;

  if (!onchainTree || !treeToDisplay) return null;

  return (
    <Stack spacing={12} w='100%'>
      <FormRowWrapper>
        <Icon as={BsPuzzle} boxSize={4} mt='2px' />
        <Box w='100%'>
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
          <Link href={CONTACT_URL} className='mt-2 text-center text-sm text-blue-500 underline' isExternal>
            Not finding a module you&apos;re looking for? Let us know here.
          </Link>
        </Box>
      </FormRowWrapper>

      {selectedModuleDetails && (
        <FormRowWrapper>
          <Icon as={BsTextLeft} boxSize={4} mt='2px' />
          <Stack spacing={3}>
            <Text size='sm' variant='medium'>
              MODULE TYPE DETAILS
            </Text>
            {selectedModuleDetails.details.map((detail: string) => (
              <Text key={detail}>{detail}</Text>
            ))}
          </Stack>
        </FormRowWrapper>
      )}

      <Stack spacing={6}>
        <ModuleArgsForm
          selectedModuleArgs={selectedModuleArgs || undefined}
          localForm={localForm}
          tokenAddress={tokenAddress}
        />
      </Stack>
    </Stack>
  );
};

export default ModuleDetailsForm;
