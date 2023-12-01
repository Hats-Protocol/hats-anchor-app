import { Box, Icon, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsPuzzle, BsTextLeft } from 'react-icons/bs';
import { isAddress } from 'viem';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import DatePicker from '@/components/atoms/DatePicker';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import FormRowWrapper from '@/components/FormRowWrapper';
import { CONTACT_URL } from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatsModules from '@/hooks/useHatsModules';
import { transformAndVerify } from '@/lib/general';
import { decimalId, prettyIdToIp } from '@/lib/hats';
import { ModuleCreationArg, ModuleDetails } from '@/types';

const ModuleDetailsForm = ({
  localForm,
  title,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  title: string;
}) => {
  const { onchainHats, treeToDisplay } = useTreeForm();
  const { modules } = useHatsModules();
  const { watch } = localForm;
  const selectedModuleField = watch('moduleType', '');

  const modulesToDisplay: ModuleDetails[] = useMemo(() => {
    const modulesForType = _.filter(modules, (m) => {
      const types = _.keys(_.pickBy(m.type, (value) => value));

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

  if (!onchainHats || !treeToDisplay) return null;

  return (
    <Stack spacing={12}>
      <FormRowWrapper>
        <Icon as={BsPuzzle} boxSize={4} mt='2px' />
        <Box>
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
          <ChakraNextLink
            href={CONTACT_URL}
            fontSize='sm'
            color='blue.500'
            decoration
            textAlign='center'
            mt={2}
            isExternal
          >
            Not finding a module you&apos;re looking for? Let us know here.
          </ChakraNextLink>
        </Box>
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
