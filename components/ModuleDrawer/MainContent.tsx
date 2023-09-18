import { Heading, Icon, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { BsPersonAdd, BsPuzzle, BsTextLeft } from 'react-icons/bs';

import Accordion from '@/components/atoms/Accordion';
import Select from '@/components/atoms/Select';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatsModules from '@/hooks/useHatsModules';
import { transformAndVerify } from '@/lib/general';
import { decimalId, prettyIdToIp } from '@/lib/hats';
import { Module, ModuleCreationArg } from '@/types';

import DatePicker from '../atoms/DatePicker';
import Input from '../atoms/Input';
import RadioBox from '../atoms/RadioBox';
import FormRowWrapper from '../FormRowWrapper';

const MainContent = ({
  localForm,
  title,
  selectedModuleDetails,
  setSelectedModuleDetails,
}: {
  localForm: any;
  title: Module;
  selectedModuleDetails: any;
  setSelectedModuleDetails: any;
}) => {
  const { onchainHats, treeToDisplay, topHatDetails } = useTreeForm();
  const { modules } = useHatsModules();
  const { handleSubmit, watch } = localForm;

  const [selectedModuleArgs, setSelectedModuleArgs] = useState<
    ModuleCreationArg[]
  >([]);

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const modulesToDisplay = useMemo(() => {
    return _.map(
      _.pickBy(modules, ({ type }) => type[title]),
      (value, key) => ({
        id: key,
        ...value,
      }),
    );
  }, [modules, title]);

  const selectedModuleType = watch('moduleType', '');

  const selectedModule = useMemo(() => {
    return _.find(modulesToDisplay, ['id', selectedModuleType]);
  }, [modulesToDisplay, selectedModuleType]);

  useEffect(() => {
    setSelectedModuleDetails(selectedModule || null);
    setSelectedModuleArgs(
      (selectedModule?.creationArgs && [
        ...selectedModule.creationArgs.immutable,
        ...selectedModule.creationArgs.mutable,
      ]) ||
        null,
    );
  }, [selectedModule]);

  if (!onchainHats || !treeToDisplay) return null;

  return (
    <Stack
      p={10}
      pt={8}
      spacing={10}
      w='100%'
      overflow='scroll'
      height='calc(100% - 75px)'
      top={75}
      pos='relative'
    >
      <Stack>
        <Heading color='blackAlpha.800' fontSize={24} fontWeight='medium'>
          Create a new Accountability Module for this hat
        </Heading>
        {topHatDetails?.description && (
          <Text color='blackAlpha.700' noOfLines={2}>
            {topHatDetails?.description}
          </Text>
        )}
      </Stack>

      <Accordion
        title='Module Basics'
        subtitle='The fundamentals of the module, including type and details.'
      >
        <Stack spacing={12}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormRowWrapper>
              <Icon as={BsPuzzle} boxSize={4} mt={1} />
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
          </form>
          {selectedModuleDetails && (
            <FormRowWrapper>
              <Icon as={BsTextLeft} boxSize={4} mt={1} />
              <Stack spacing={3}>
                <Text fontSize='sm' fontWeight='medium'>
                  MODULE TYPE DETAILS
                </Text>
                {selectedModuleDetails.details.map((detail: any) => (
                  <Text key={detail}>{detail}</Text>
                ))}
              </Stack>
            </FormRowWrapper>
          )}
          {selectedModuleArgs?.map((arg: ModuleCreationArg) => (
            <FormRowWrapper key={arg.name}>
              <Icon as={BsTextLeft} boxSize={4} mt={1} />
              {arg.displayType === 'default' && (
                <Input
                  name={arg.name}
                  label={arg.name}
                  subLabel={arg.description}
                  placeholder={
                    Array.isArray(arg.example)
                      ? arg.example.join(', ')
                      : arg.example
                  }
                  options={{
                    required: true,
                    validate: (value) => transformAndVerify(value, arg.type),
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
              {arg.displayType === 'seconds' && (
                <Input
                  name={arg.name}
                  label={arg.name}
                  type='number'
                  subLabel={arg.description}
                  placeholder={
                    Array.isArray(arg.example)
                      ? arg.example.join(', ')
                      : arg.example
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
      </Accordion>

      <Accordion
        title='Claims Hatter Contract'
        subtitle='Make this hat claimable by deploying a new hatter contract.'
      >
        <FormRowWrapper>
          <Icon as={BsPersonAdd} boxSize={4} mt={1} />
          <RadioBox
            name='claimable'
            label='Hat ClaimIng'
            subLabel='Should this hat be permissionlessly claimable by potential wearers who meet the requirements of the accountability module?'
            localForm={localForm}
            options={[
              {
                label: 'Yes',
                value: 'Yes',
              },
              {
                label: 'No — admin mint only',
                value: 'No',
              },
            ]}
          />
        </FormRowWrapper>
      </Accordion>
    </Stack>
  );
};

export default MainContent;
