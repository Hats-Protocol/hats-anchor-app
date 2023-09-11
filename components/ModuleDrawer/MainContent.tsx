import { Heading, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useForm } from 'react-hook-form';

import Accordion from '@/components/atoms/Accordion';
import Select from '@/components/atoms/Select';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatsModules from '@/hooks/useHatsModules';

const MainContent = () => {
  const { onchainHats, treeToDisplay, topHatDetails } = useTreeForm();
  const localForm = useForm({
    mode: 'onBlur',
  });
  const { handleSubmit } = localForm;

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const { modules } = useHatsModules();
  console.log('modules', modules);

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
          <Select
            label='Select new Admin Hat'
            name='newAdmin'
            localForm={localForm}
          >
            {_.map(modules, ({ name }) => (
              <option value={name} key={name}>
                {name}
              </option>
            ))}
          </Select>
        </form>
      </Accordion>
    </Stack>
  );
};

export default MainContent;
