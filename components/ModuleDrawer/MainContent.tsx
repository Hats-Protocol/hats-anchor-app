import { Heading, Icon, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import { BsPuzzle } from 'react-icons/bs';

import Accordion from '@/components/atoms/Accordion';
import Select from '@/components/atoms/Select';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatsModules from '@/hooks/useHatsModules';
import { Module } from '@/types';

import FormRowWrapper from '../FormRowWrapper';

const MainContent = ({ title }: { title: Module }) => {
  const { onchainHats, treeToDisplay, topHatDetails } = useTreeForm();
  const localForm = useForm({
    mode: 'onBlur',
  });
  const { handleSubmit } = localForm;

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const { modules } = useHatsModules();
  const modulesToDisplay = _.pickBy(modules, ({ type }) => type[title]);

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
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormRowWrapper>
            <Icon as={BsPuzzle} boxSize={4} mt={1} />
            <Select
              label='Module Type'
              subLabel='The category of prewritten module to connect to this hat.'
              name='module'
              localForm={localForm}
            >
              {_.map(modulesToDisplay, ({ name }) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
            </Select>
          </FormRowWrapper>
        </form>
      </Accordion>
    </Stack>
  );
};

export default MainContent;
