'use client';

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
import { WriteFunction } from '@hatsprotocol/hsg-sdk';
import {
  Modal,
  useEligibility,
  useStandaloneOverlay as useOverlay,
} from 'contexts';
import { ModuleArgsForm } from 'forms';
import _ from 'lodash';
import { useCallModuleFunction } from 'modules-hooks';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { formatAddress, parsedSeconds } from 'utils';
import { useChainId } from 'wagmi';

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
  const currentTermEndDate = parsedSeconds(currentTermEnd?.value as bigint);
  const nextTermEndDate = parsedSeconds(nextTermEnd?.value as bigint);

  const [selectedFunction, setSelectedFunction] = useState(null);
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const formMethods = useForm({ mode: 'onChange' });
  const { formState, handleSubmit } = formMethods;
  const moduleActions: WriteFunction[] | undefined = _.get(
    moduleDetails,
    'writeFunctions',
  );

  const accessibleActions = useMemo(() => {
    return _.filter(moduleActions, (action: WriteFunction) => {
      if (
        action.functionName === 'setNextTerm' &&
        ((nextTermEnd?.value && nextTermEnd.value === BigInt(0)) ||
          (nextTermEndDate && nextTermEndDate > new Date()))
      ) {
        return false;
      }

      const canElect =
        action.functionName === 'elect' &&
        electionsAuthority.isWearingBallotBoxHat &&
        !!nextTermEnd?.value;

      const canStartNextTerm =
        action.functionName === 'startNextTerm' &&
        currentTermEndDate &&
        new Date().getTime() > currentTermEndDate?.getTime() &&
        !!nextTermEnd?.value &&
        (nextTermEnd.value as bigint) > BigInt(0);

      return (
        _.some(
          action.roles,
          (role: string) =>
            _.includes(electionsAuthority.userRoles, role) ||
            (role === 'public' && canStartNextTerm),
        ) || canElect
      );
    });
  }, [
    moduleActions,
    electionsAuthority,
    nextTermEnd?.value,
    nextTermEndDate,
    currentTermEndDate,
  ]);

  const { mutateAsync: callModuleFunction } = useCallModuleFunction({
    chainId,
  });

  if (!moduleDetails || !moduleParameters || !controllerAddress) return null;

  const handleFunctionCall = (func: any) => {
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

  const onSubmit = async (values: any) => {
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
      <Flex justifyContent='space-between' gap={2} wrap='wrap'>
        <Box w={{ base: '100%', md: '48%' }}>
          <DateInfo date={nextTermEndDate} label='Next Season End' />
        </Box>
      </Flex>
      {!_.isEmpty(accessibleActions) && (
        <Flex gap={2} wrap='wrap' justifyContent='center'>
          {_.map(accessibleActions, (action: WriteFunction) => (
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
                {_.capitalize(action.label)}
              </Button>
            </Tooltip>
          ))}
        </Flex>
      )}

      <Modal
        name='functionCall-module'
        title={`Interact with ${moduleDetails?.name} (${formatAddress(
          controllerAddress,
        )})`}
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
                >
                  {_.capitalize(_.get(selectedFunction, 'label'))}
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
