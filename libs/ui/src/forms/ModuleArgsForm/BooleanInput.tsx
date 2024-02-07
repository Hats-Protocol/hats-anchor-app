import { HStack, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';
import {
  FALLBACK_ARG_EXAMPLES,
  MODULE_ARG_BOOLEAN_OPTION_SETS,
} from '@hatsprotocol/constants';
import { ModuleCreationArg } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

const BooleanInput = ({
  arg,
  localForm,
}: {
  arg: ModuleCreationArg;
  localForm: UseFormReturn;
}) => {
  const booleanOptions =
    MODULE_ARG_BOOLEAN_OPTION_SETS[_.toLower(arg.name)] ||
    FALLBACK_ARG_EXAMPLES.booleanOption;

  useEffect(() => {
    // set default value(s)
    if (arg.type === 'bool') setValue(arg.name, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { setValue } = localForm;

  return (
    <Stack spacing={1}>
      <Stack alignItems='start' spacing={1}>
        <HStack>
          <Text textTransform='uppercase'>{arg.name}</Text>
        </HStack>
        <Text color='gray.600' fontSize='sm'>
          {arg.description}
        </Text>
      </Stack>

      <RadioGroup
        name={arg.name}
        defaultValue={_.first(booleanOptions)}
        onChange={(value) => setValue(arg.name, value)}
      >
        <HStack spacing={4}>
          {_.map(booleanOptions, (option) => (
            <Radio value={option} key={option}>
              {option}
            </Radio>
          ))}
        </HStack>
      </RadioGroup>
    </Stack>
  );
};

export default BooleanInput;
