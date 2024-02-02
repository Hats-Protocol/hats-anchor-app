import {
  Box,
  Button,
  Flex,
  HStack,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { formatAddress } from 'app-utils';
import { useCallModuleFunction } from 'hats-hooks';
import _ from 'lodash';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from 'ui';

import { useEligibility } from '../../contexts/EligibilityContext';
import { useOverlay } from '../../contexts/OverlayContext';
import ModuleArgsForm from '../ModuleArgsForm';

const UpcomingSeason = () => {
  const { moduleDetails, controllerAddress, chainId } = useEligibility();
  const [selectedFunction, setSelectedFunction] = useState(null);
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const formMethods = useForm({ mode: 'onChange' });
  const { formState, handleSubmit } = formMethods;

  const moduleActions = _.filter(_.get(moduleDetails, 'writeFunctions'), (fn) =>
    _.includes(fn.roles, 'public'),
  );

  const { mutate: callModuleFunction, isLoading: isModuleLoading } =
    useCallModuleFunction({
      chainId,
    });

  const handleFunctionCall = (func) => {
    if (func.args && func.args.length > 0) {
      setSelectedFunction(func);
      setModals?.({ 'functionCall-module': true });
    } else {
      callModuleFunction({
        moduleId: moduleDetails.implementationAddress,
        instance: controllerAddress,
        func,
        args: [],
      });
    }
  };

  const onSubmit = (values) => {
    // eslint-disable-next-line no-console
    console.log(values);
  };

  return (
    <Stack>
      <Text fontWeight='bold'>Upcoming Season</Text>
      <Flex gap={2} wrap='wrap'>
        {_.map(moduleActions, (action) => (
          <Tooltip label={action.description} key={action.label}>
            <Button
              variant='outlineMatch'
              colorScheme='blue.500'
              size='sm'
              onClick={() => handleFunctionCall(action)}
            >
              {action.label}
            </Button>
          </Tooltip>
        ))}
      </Flex>
      <Modal
        name='functionCall-module'
        title={`Interact with ${moduleDetails?.name} (${formatAddress(
          controllerAddress,
        )})`}
        localOverlay={localOverlay}
      >
        <Box as='form' onSubmit={handleSubmit(onSubmit)}>
          {selectedFunction?.description && (
            <Text mb={3}>{selectedFunction?.description}</Text>
          )}
          <Stack>
            <ModuleArgsForm
              selectedModuleArgs={selectedFunction?.args}
              localForm={formMethods}
              hideIcon
              noMargin
            />
          </Stack>
          <Flex justify='flex-end' mt={4}>
            <HStack>
              <Button variant='outline' onClick={() => setModals({})}>
                Cancel
              </Button>
              <Button
                colorScheme='blue'
                type='submit'
                isDisabled={!formState.isValid}
                isLoading={isModuleLoading}
              >
                {selectedFunction?.label}
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Modal>
    </Stack>
  );
};

export default UpcomingSeason;
