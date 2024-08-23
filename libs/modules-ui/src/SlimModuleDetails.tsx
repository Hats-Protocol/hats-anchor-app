'use client';

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { TOKEN_ARG_TYPES } from '@hatsprotocol/constants';
import { Modal, useEligibility, useOverlay } from 'contexts';
import { ModuleArgsForm } from 'forms';
import _ from 'lodash';
import { useCallModuleFunction, useModuleDetails } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiExternalLink } from 'react-icons/fi';
import { LinkObject, ModuleFunction } from 'types';
import { formatAddress } from 'utils';
import { Hex } from 'viem';

import ModuleParameters from './ModuleParameters';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

const ModuleDetails = ({ type }: { type: string }) => {
  const [selectedFunction, setSelectedFunction] = useState(null);
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { chainId, selectedHat } = useEligibility();

  const controllerAddress = useMemo(
    () => _.get(selectedHat, _.toLower(type)),
    [selectedHat, type],
  );

  const { details: moduleDetails, parameters } = useModuleDetails({
    address: controllerAddress,
    chainId,
  });

  const formMethods = useForm({
    mode: 'onChange',
  });

  const { formState, handleSubmit } = formMethods;

  const tokenAddress = _.get(
    _.find(parameters, (param: any) =>
      _.includes(TOKEN_ARG_TYPES, param.displayType),
    ),
    'value',
  );

  const moduleActions = _.filter(
    _.get(moduleDetails, 'writeFunctions'),
    (fn: ModuleFunction) => _.includes(fn.roles, 'public'),
  );

  const { mutate: callModuleFunction } = useCallModuleFunction({
    chainId,
  });

  const handleFunctionCall = (func: any) => {
    if (func.args && func.args.length > 0) {
      setSelectedFunction(func);
      setModals?.({ 'functionCall-module': true });
    } else {
      if (!moduleDetails?.implementationAddress) return;
      callModuleFunction({
        moduleId: moduleDetails.implementationAddress,
        instance: controllerAddress,
        func,
        args: [],
      });
    }
  };

  const onSubmit = (values: any) => {
    if (!moduleDetails?.implementationAddress) return;
    // eslint-disable-next-line no-console
    callModuleFunction({
      moduleId: moduleDetails.implementationAddress,
      instance: controllerAddress,
      func: selectedFunction || undefined,
      args: values,
    });
  };

  if (!moduleDetails || !chainId) return null;

  return (
    <Accordion allowMultiple>
      {!_.isEmpty(moduleActions) && (
        <>
          <Modal
            name='functionCall-module'
            title={`Interact with ${moduleDetails?.name} (${formatAddress(
              controllerAddress,
            )})`}
          >
            <Box as='form' onSubmit={handleSubmit(onSubmit)}>
              {_.get(selectedFunction, 'description') && (
                <Text mb={3}>{_.get(selectedFunction, 'description')}</Text>
              )}
              <Stack>
                {_.get(selectedFunction, 'args') && (
                  <ModuleArgsForm
                    selectedModuleArgs={_.get(selectedFunction, 'args', [])}
                    tokenAddress={tokenAddress as Hex}
                    localForm={formMethods}
                    hideIcon
                    noMargin
                  />
                )}
              </Stack>
              <Flex justify='flex-end' mt={4}>
                <HStack>
                  <Button variant='outline' onClick={() => setModals?.({})}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme='blue'
                    type='submit'
                    isDisabled={!formState.isValid}
                    // isLoading={isModuleLoading}
                  >
                    {_.get(selectedFunction, 'label')}
                  </Button>
                </HStack>
              </Flex>
            </Box>
          </Modal>
          <AccordionItem border='0'>
            <AccordionButton px={0}>
              <HStack>
                <Heading size='xs' variant='medium' textTransform='uppercase'>
                  Module Actions
                </Heading>
                <AccordionIcon />
              </HStack>
            </AccordionButton>
            <AccordionPanel px={0}>
              <Flex gap={2} wrap='wrap'>
                {_.map(moduleActions, (action: any) => (
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
            </AccordionPanel>
          </AccordionItem>
        </>
      )}
      <AccordionItem border='0'>
        <AccordionButton px={0}>
          <HStack>
            <Heading size='xs' variant='medium' textTransform='uppercase'>
              Module Details
            </Heading>
            <AccordionIcon />
          </HStack>
        </AccordionButton>
        <AccordionPanel px={0}>
          <Stack>
            {_.map(moduleDetails.details, (detail: string) => (
              <Text key={detail} size='sm'>
                {detail}
              </Text>
            ))}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
      {!_.isEmpty(parameters) && (
        <AccordionItem border='0'>
          <AccordionButton px={0}>
            <HStack>
              <Heading size='xs' variant='medium' textTransform='uppercase'>
                Module Parameters
              </Heading>
              <AccordionIcon />
            </HStack>
          </AccordionButton>
          <AccordionPanel px={0}>
            <ModuleParameters parameters={parameters} chainId={chainId} />
          </AccordionPanel>
        </AccordionItem>
      )}

      <AccordionItem border='0'>
        <AccordionButton px={0}>
          <HStack>
            <Heading size='xs' fontWeight='medium' textTransform='uppercase'>
              Module Links
            </Heading>
            <AccordionIcon />
          </HStack>
        </AccordionButton>
        <AccordionPanel px={0}>
          <Stack>
            {_.map(moduleDetails.links, (link: LinkObject) => (
              <ChakraNextLink
                href={link.link || '#'}
                key={link.link}
                isExternal
              >
                <Flex justify='space-between'>
                  <Text size='sm'>{link.label}</Text>
                  <Icon as={FiExternalLink} h='14px' color='gray.500' />
                </Flex>
              </ChakraNextLink>
            ))}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default ModuleDetails;
