import { Button, Flex, HStack, Icon } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { BsBoxArrowRight, BsXSquare } from 'react-icons/bs';

import useDebounce from '@/hooks/useDebounce';
import { ModuleCreationArg } from '@/types';

const TopMenu = ({
  localForm,
  onCloseModuleDrawer,
  selectedModuleArgs,
}: {
  localForm: any;
  onCloseModuleDrawer: () => void;
  selectedModuleArgs: ModuleCreationArg[];
}) => {
  const { watch, getValues, formState } = localForm;

  const selectedModuleType = watch('moduleType');

  const [isButtonEnabled, setButtonEnabled] = useState(false);
  const argNames = useMemo(() => {
    if (selectedModuleArgs) {
      return selectedModuleArgs.map((arg) => arg.name);
    }
    return [];
  }, [selectedModuleArgs]);
  const dynamicFields = useDebounce(watch(argNames));

  useEffect(() => {
    if (
      formState?.isDirty &&
      selectedModuleType &&
      argNames &&
      argNames.length
    ) {
      const formValues = getValues();

      const areAllFieldsFilled = argNames.every((name) => {
        return (
          formValues[name] !== undefined &&
          formValues[name] !== null &&
          formValues[name] !== ''
        );
      });

      setButtonEnabled(areAllFieldsFilled);
    } else {
      setButtonEnabled(false);
    }
  }, [selectedModuleType, formState, dynamicFields, argNames, getValues]);

  return (
    <Flex
      w='100%'
      borderBottom='1px solid'
      borderColor='gray.200'
      h='75px'
      bg='whiteAlpha.900'
      align='center'
      justify='space-between'
      px={4}
      position='absolute'
      top={0}
      zIndex={16}
    >
      <Button
        variant='outline'
        borderColor='gray.300'
        onClick={onCloseModuleDrawer}
        leftIcon={<Icon as={BsXSquare} />}
      >
        Cancel
      </Button>

      <HStack spacing={3}>
        <Button
          leftIcon={<BsBoxArrowRight />}
          colorScheme='twitter'
          variant='solid'
          isDisabled={!isButtonEnabled}
          onClick={() => {
            // toast for save
            onCloseModuleDrawer();
          }}
        >
          Deploy & Return
        </Button>
      </HStack>
    </Flex>
  );
};

export default TopMenu;
