import { Heading, Icon, Stack, Text } from '@chakra-ui/react';
import { m } from 'framer-motion';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BsPuzzle, BsTextLeft } from 'react-icons/bs';

import Accordion from '@/components/atoms/Accordion';
import Select from '@/components/atoms/Select';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatsModules from '@/hooks/useHatsModules';
import { Module, ModuleCreationArg } from '@/types';

import DatePicker from '../atoms/DatePicker';
import Input from '../atoms/Input';
import FormRowWrapper from '../FormRowWrapper';

const MainContent = ({ title }: { title: Module }) => {
  const { onchainHats, treeToDisplay, topHatDetails } = useTreeForm();
  const { modules } = useHatsModules();
  const [selectedModuleDetails, setSelectedModuleDetails] = useState<any>(null);
  const [selectedModuleArgs, setSelectedModuleArgs] = useState<any>(null);
  const localForm = useForm({
    mode: 'onBlur',
  });
  const { handleSubmit, watch } = localForm;

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

  const selectedModuleId = watch('module', '');

  const selectedModule = useMemo(() => {
    return _.find(modulesToDisplay, ['id', selectedModuleId]);
  }, [modulesToDisplay, selectedModuleId]);

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

  console.log('modulesToDisplay', modulesToDisplay);
  console.log('selectedModuleDetails', selectedModuleDetails);

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
                name='module'
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
                  localForm={localForm}
                />
              )}
              {arg.displayType === 'hat' && (
                <Input
                  name={arg.name}
                  label={arg.name}
                  subLabel={arg.description}
                  placeholder={
                    Array.isArray(arg.example)
                      ? arg.example.join(', ')
                      : arg.example
                  }
                  localForm={localForm}
                />
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
                  localForm={localForm}
                />
              )}
            </FormRowWrapper>
          ))}
        </Stack>
      </Accordion>
    </Stack>
  );
};

export default MainContent;
