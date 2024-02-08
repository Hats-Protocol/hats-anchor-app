import { Box, Icon, Stack, Text } from '@chakra-ui/react';
import { CONTACT_URL } from '@hatsprotocol/constants';
import { useTreeForm } from 'contexts';
import { useHatsModules } from 'hats-hooks';
import { ModuleDetails } from 'hats-types';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsPuzzle, BsTextLeft } from 'react-icons/bs';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);
const FormRowWrapper = dynamic(() =>
  import('ui').then((mod) => mod.FormRowWrapper),
);
const ModuleArgsForm = dynamic(() =>
  import('ui').then((mod) => mod.ModuleArgsForm),
);
const Select = dynamic(() => import('ui').then((mod) => mod.Select));

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
  // console.log(selectedModuleArgs, 'selectedModuleArgs');

  const tokenArgName = _.get(
    _.find(selectedModuleArgs, { displayType: 'erc20' }),
    'name',
  );
  const tokenAddress = watch(tokenArgName, '');
  // console.log(tokenArgName, tokenAddress, 'tokenAddress');

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

      <Stack spacing={6}>
        <ModuleArgsForm
          selectedModuleArgs={selectedModuleArgs}
          localForm={localForm}
          tokenAddress={tokenAddress}
        />
      </Stack>
    </Stack>
  );
};

export default ModuleDetailsForm;
