import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { formatAddress } from 'app-utils';
import { useCallModuleFunction } from 'hats-hooks';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, ModuleArgsForm } from 'ui';
import { useChainId } from 'wagmi';

import { useEligibility, useStandaloneOverlay as useOverlay } from 'contexts';
import DateInfo from './DateInfo';

const UpcomingSeason = () => {
  const {
    moduleDetails,
    moduleParameters,
    controllerAddress,
    chainId,
    electionsAuthority,
  } = useEligibility();

  const currentNetworkId = useChainId();
  const isSameChain = chainId === currentNetworkId;

  const currentTermEnd = _.find(moduleParameters, {
    label: 'Current Term End',
  });

  const nextTermEnd = _.find(moduleParameters, {
    label: 'Next Term End',
  });

  let currentTermEndDate;
  if (typeof currentTermEnd?.value === 'bigint') {
    currentTermEndDate = new Date(Number(currentTermEnd.value) * 1000);
  } else {
    console.error('Invalid value for currentTermEnd: ', currentTermEnd?.value);
    currentTermEndDate = new Date();
  }

  let nextTermEndDate;
  if (typeof nextTermEnd?.value === 'bigint') {
    nextTermEndDate =
      nextTermEnd.value === BigInt(0)
        ? null
        : new Date(Number(nextTermEnd.value) * 1000);
  } else {
    console.error('Invalid value for nextTermEnd: ', nextTermEnd?.value);
    nextTermEndDate = null;
  }

  const [selectedFunction, setSelectedFunction] = useState(null);
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const formMethods = useForm({ mode: 'onChange' });
  const { formState, handleSubmit } = formMethods;
  const moduleActions = _.get(moduleDetails, 'writeFunctions');
  const accessibleActions = useMemo(() => {
    return _.filter(moduleActions, (action) => {
      if (
        action.functionName === 'setNextTerm' &&
        (nextTermEndDate === null ||
          nextTermEndDate.getTime() > new Date().getTime())
      ) {
        return false;
      }

      const canElect =
        action.functionName === 'elect' &&
        electionsAuthority.isWearingBallotBoxHat &&
        !!nextTermEnd?.value;

      const canStartNextTerm =
        action.functionName === 'startNextTerm' && !!nextTermEnd?.value;

      return (
        _.some(
          action.roles,
          (role) =>
            _.includes(electionsAuthority.userRoles, role) || role === 'public',
        ) ||
        canElect ||
        canStartNextTerm
      );
    });
  }, [moduleActions, electionsAuthority, nextTermEnd?.value]);

  const { mutate: callModuleFunction, isLoading: isModuleLoading } =
    useCallModuleFunction({ chainId });

  if (!moduleDetails || !moduleParameters || !controllerAddress) return null;

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

  const onSubmit = async (values) => {
    if (!selectedFunction) return;
    await callModuleFunction({
      moduleId: moduleDetails.implementationAddress,
      instance: controllerAddress,
      func: selectedFunction,
      args: values,
    });
    setModals?.({});
  };

  return (
    <Stack gap={4}>
      <Heading size='md'>Upcoming Season</Heading>
      <HStack justifyContent='space-between' gap={4}>
        <Box w='50%'>
          <DateInfo date={currentTermEndDate} label='Current Season End' />
        </Box>
        {nextTermEndDate && (
          <Box w='50%'>
            <DateInfo date={nextTermEndDate} label='Next Season End' />
          </Box>
        )}
      </HStack>
      <Flex gap={2} wrap='wrap' justifyContent='center'>
        {_.map(accessibleActions, (action) => (
          <Tooltip
            label={
              !isSameChain
                ? 'Please switch to the correct network'
                : action.description
            }
            key={action.label}
          >
            <Button
              variant='outline'
              borderColor='blackAlpha.300'
              fontWeight='medium'
              size='sm'
              isDisabled={!isSameChain}
              onClick={() => handleFunctionCall(action)}
            >
              {action.label.charAt(0).toUpperCase() + action.label.slice(1)}
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
          <Stack spacing={4}>
            {_.get(selectedFunction, 'description') && (
              <Text>{_.get(selectedFunction, 'description')}</Text>
            )}
            <Stack>
              <ModuleArgsForm
                selectedModuleArgs={_.get(selectedFunction, 'args', [])}
                localForm={formMethods}
                hideIcon
                noMargin
              />
            </Stack>
            <Flex justify='flex-end'>
              <HStack>
                <Button variant='outline' onClick={() => setModals?.({})}>
                  Cancel
                </Button>
                <Button
                  colorScheme='blue'
                  type='submit'
                  isDisabled={!formState.isValid}
                  isLoading={isModuleLoading}
                >
                  {_.get(selectedFunction, 'label')}
                </Button>
              </HStack>
            </Flex>
          </Stack>
        </Box>
      </Modal>
    </Stack>
  );
};

export default UpcomingSeason;
