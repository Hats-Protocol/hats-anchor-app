import { Box, Icon, Stack, Text } from '@chakra-ui/react';
import { CONTACT_URL } from 'app-constants';
import { transformAndVerify } from 'app-utils';
import { useHatsModules } from 'hats-hooks';
import { Hat, ModuleCreationArg, ModuleDetails } from 'hats-types';
import { decimalId } from 'hats-utils';
import _ from 'lodash';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsPuzzle, BsTextLeft } from 'react-icons/bs';
import { prettyIdToIp } from 'shared-utils';
import { isAddress } from 'viem';

import { useTreeForm } from '../../../contexts/TreeFormContext';
import ChakraNextLink from '../../atoms/ChakraNextLink';
import DatePicker from '../../atoms/DatePicker';
import Input from '../../atoms/Input';
import Select from '../../atoms/Select';
import FormRowWrapper from '../../FormRowWrapper';

const ModuleDetailsForm = ({
  localForm,
  title,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  title: string;
}) => {
  const { onchainTree, treeToDisplay, chainId } = useTreeForm();
  const { modules } = useHatsModules({ chainId });
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

  if (!onchainTree || !treeToDisplay) return null;

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
              {_.map(onchainTree, ({ id, prettyId, detailsObject }: Hat) => (
                <option value={decimalId(id)} key={id}>
                  {`${
                    detailsObject?.data?.name
                      ? `${detailsObject?.data?.name} - `
                      : ''
                  }${prettyIdToIp(prettyId)}`}
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
