import { Heading, Icon, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import {
  BsBarChartLine,
  BsPersonAdd,
  BsPuzzle,
  BsTextLeft,
} from 'react-icons/bs';

import Accordion from '@/components/atoms/Accordion';
import Select from '@/components/atoms/Select';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatsModules from '@/hooks/useHatsModules';
import { transformAndVerify } from '@/lib/general';
import {
  decimalId,
  getAllParents,
  idToPrettyId,
  prettyIdToIp,
} from '@/lib/hats';
import { ModuleCreationArg, ModuleKind } from '@/types';

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
  title: ModuleKind;
  selectedModuleDetails: any;
  setSelectedModuleDetails: any;
}) => {
  const { onchainHats, treeToDisplay, topHatDetails, selectedHat } =
    useTreeForm();
  const { modules } = useHatsModules();
  const { watch } = localForm;
  const selectedModuleType = watch('moduleType', '');
  const adminHat = localForm.watch('adminHat');

  const [selectedModuleArgs, setSelectedModuleArgs] = useState<
    ModuleCreationArg[] | null
  >([]);

  const modulesToDisplay = useMemo(() => {
    return _.map(
      _.pickBy(modules, ({ type }) => type[title]),
      (value, key) => ({
        id: key,
        ...value,
      }),
    );
  }, [modules, title]);

  const selectedModule = useMemo(() => {
    return _.find(modulesToDisplay, ['id', selectedModuleType]);
  }, [modulesToDisplay, selectedModuleType]);

  const parentHats = useMemo(() => {
    return getAllParents(selectedHat?.id, treeToDisplay);
  }, [selectedHat, treeToDisplay]);

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
      </Accordion>

      <Accordion
        title='Permissionless Claiming'
        subtitle='Make this hat claimable by deploying a new hatter contract.'
      >
        <Stack spacing={12}>
          <FormRowWrapper>
            <Icon as={BsPersonAdd} boxSize={4} mt='2px' />
            <RadioBox
              name='Claimable For'
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
          <FormRowWrapper>
            <Icon as={BsPuzzle} boxSize={4} mt='2px' />
            <Stack>
              <Select
                name='adminHat'
                label='ADMIN HAT'
                subLabel='To enable permissionless claiming, give an admin hat in this tree to the new hatter contract. Must be a non-top hat admin of this hat.'
                localForm={localForm}
                placeholder='Select a hat in this tree'
                defaultValue={undefined}
                options={{
                  required: true,
                }}
              >
                {_.map(parentHats, (id) => (
                  <option value={decimalId(id)} key={id}>
                    {prettyIdToIp(idToPrettyId(id))}
                  </option>
                ))}
              </Select>
              {adminHat && (
                <Text color='blackAlpha.600'>
                  Potential wearers will be able to claim this hat if they meet
                  the requirements in new module above.
                </Text>
              )}
            </Stack>
          </FormRowWrapper>
          {selectedHat?.wearers === selectedHat?.maxSupply && (
            <FormRowWrapper>
              <Icon as={BsBarChartLine} boxSize={4} mt='2px' />
              <Stack>
                <RadioBox
                  name='increment'
                  label='Increment Max Wearers by 1'
                  subLabel='The admin hat you selected (2.3 — Builder Custodian) has no more available supply to mint. Do you want to increase the max wearers by 1 in order to mint this hat to the new hatter contract?'
                  localForm={localForm}
                  options={[
                    {
                      label: `Yes — increase max wearers from ${
                        selectedHat?.maxSupply
                      } to ${Number(selectedHat?.maxSupply) + 1}`,
                      value: 'Yes',
                    },
                    {
                      label: 'No (cancel deployment)',
                      value: 'No',
                    },
                  ]}
                />
              </Stack>
            </FormRowWrapper>
          )}
        </Stack>
      </Accordion>
    </Stack>
  );
};

export default MainContent;
